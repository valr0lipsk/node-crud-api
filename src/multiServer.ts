import cluster from "cluster";
import os from "os";
import { createServer, IncomingMessage, ServerResponse } from "http";
import app from "./app";
import { userModel, User } from "./models/user.model";

const numCPUs = os.cpus().length;
const basePort = Number(process.env.PORT) || 4000;

type IPCMessage =
  | { type: "SYNC_STATE"; state: User[] }
  | {
      type: "STATE_UPDATE";
      operation: "create" | "update" | "delete";
      user: User | null;
      id?: string;
    };

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  const workerPorts: { [key: number]: number } = {};

  for (let i = 1; i < numCPUs; i++) {
    const workerPort = basePort + i;
    const worker = cluster.fork({ WORKER_PORT: workerPort });
    workerPorts[worker.id] = workerPort;

    worker.on("message", (msg: IPCMessage) => {
      console.log(`Primary received message from worker:`, msg);
      if (msg.type === "STATE_UPDATE") {
        for (const id in cluster.workers) {
          cluster.workers[id]?.send(msg);
        }
      }
    });
  }

  cluster.on("exit", (worker, _code, _signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    const newWorker = cluster.fork({ WORKER_PORT: workerPorts[worker.id] });
    workerPorts[newWorker.id] = workerPorts[worker.id];
    delete workerPorts[worker.id];

    const currentState = userModel.findAll();
    console.log(`Sending current state to new worker:`, currentState);
    newWorker.send({ type: "SYNC_STATE", state: currentState });
  });

  const loadBalancer = createServer(
    (req: IncomingMessage, res: ServerResponse) => {
      if (cluster.workers) {
        const workerIds = Object.keys(cluster.workers);
        const workerId =
          workerIds[Math.floor(Math.random() * workerIds.length)];
        const workerPort = workerPorts[Number(workerId)];

        console.log(
          `Load Balancer: Forwarding request to worker ${workerId} on port ${workerPort}`
        );

        const options = {
          hostname: "localhost",
          port: workerPort,
          path: req.url,
          method: req.method,
          headers: req.headers,
        };

        const proxyReq = require("http").request(options, (proxyRes: any) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        });

        req.pipe(proxyReq);
      } else {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("No workers available");
      }
    }
  );

  loadBalancer.listen(basePort, () => {
    console.log(`Load balancer running on port ${basePort}`);
  });
} else {
  const workerPort = Number(process.env.WORKER_PORT);

  process.on("message", (msg: IPCMessage) => {
    if (msg.type === "SYNC_STATE") {
      userModel["users"] = msg.state;
    } else if (msg.type === "STATE_UPDATE") {
      switch (msg.operation) {
        case "create":
        case "update":
          if (msg.user) {
            userModel["users"] = userModel["users"].filter(
              (u) => u.id !== msg.user?.id
            );
            userModel["users"].push(msg.user);
          }
          break;
        case "delete":
          if (msg.id) {
            userModel["users"] = userModel["users"].filter(
              (u) => u.id !== msg.id
            );
          }
          break;
      }
    }
  });

  const originalCreate = userModel.create;
  userModel.create = function (userData) {
    const result = originalCreate.call(this, userData);
    if ("id" in result) {
      process.send?.({
        type: "STATE_UPDATE",
        operation: "create",
        user: result,
      });
    }
    return result;
  };

  const originalUpdate = userModel.update;
  userModel.update = function (id, userData) {
    const result = originalUpdate.call(this, id, userData);
    if (result && "id" in result) {
      process.send?.({
        type: "STATE_UPDATE",
        operation: "update",
        user: result,
      });
    }
    return result;
  };

  const originalDelete = userModel.delete;
  userModel.delete = function (id) {
    const result = originalDelete.call(this, id);
    if (result) {
      process.send?.({
        type: "STATE_UPDATE",
        operation: "delete",
        user: null,
        id,
      });
    }
    return result;
  };

  const server = createServer(app);

  server.listen(workerPort, () => {
    console.log(`Worker ${process.pid} started on port ${workerPort}`);
  });
}
