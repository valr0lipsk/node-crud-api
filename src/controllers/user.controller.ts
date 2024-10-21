import { IncomingMessage, ServerResponse } from "http";
import { validate as uuidValidate } from "uuid";
import { userModel } from "../models/user.model";
import { parse as parseUrl } from "url";

async function getRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(null);
      }
    });
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any): void {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

export const userController = {
  async handleRequest(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const url = parseUrl(req.url || "");
    const pathSegments = url.pathname?.split("/").filter(Boolean) || [];
    const method = req.method || "GET";

    if (pathSegments.length === 2) {
      if (method === "GET") {
        return this.getAllUsers(req, res);
      }
      if (method === "POST") {
        return this.createUser(req, res);
      }
    } else if (pathSegments.length === 3) {
      const id = pathSegments[2];
      if (method === "GET") {
        return this.getUserById(req, res, id);
      }
      if (method === "PUT") {
        return this.updateUser(req, res, id);
      }
      if (method === "DELETE") {
        return this.deleteUser(req, res, id);
      }
    }

    sendJson(res, 404, { message: "Resource not found" });
  },

  getAllUsers(_req: IncomingMessage, res: ServerResponse): void {
    const users = userModel.findAll();
    sendJson(res, 200, users);
  },

  getUserById(_req: IncomingMessage, res: ServerResponse, id: string): void {
    if (!uuidValidate(id)) {
      sendJson(res, 400, { message: "Invalid user id" });
      return;
    }

    const user = userModel.findById(id);
    if (!user) {
      sendJson(res, 404, { message: "User not found" });
      return;
    }

    sendJson(res, 200, user);
  },

  async createUser(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const body = await getRequestBody(req);

    if (!body) {
      sendJson(res, 400, { message: "Invalid request body" });
      return;
    }

    const { username, age, hobbies } = body;
    if (!username || typeof age !== "number" || !Array.isArray(hobbies)) {
      sendJson(res, 400, { message: "Invalid user data" });
      return;
    }

    const newUser = userModel.create({ username, age, hobbies });
    sendJson(res, 201, newUser);
  },

  async updateUser(
    req: IncomingMessage,
    res: ServerResponse,
    id: string
  ): Promise<void> {
    if (!uuidValidate(id)) {
      sendJson(res, 400, { message: "Invalid user id" });
      return;
    }

    const body = await getRequestBody(req);
    if (!body) {
      sendJson(res, 400, { message: "Invalid request body" });
      return;
    }

    const { username, age, hobbies } = body;
    if (!username || typeof age !== "number" || !Array.isArray(hobbies)) {
      sendJson(res, 400, { message: "Invalid user data" });
      return;
    }

    const updatedUser = userModel.update(id, { username, age, hobbies });
    if (!updatedUser) {
      sendJson(res, 404, { message: "User not found" });
      return;
    }

    sendJson(res, 200, updatedUser);
  },

  deleteUser(_req: IncomingMessage, res: ServerResponse, id: string): void {
    if (!uuidValidate(id)) {
      sendJson(res, 400, { message: "Invalid user id" });
      return;
    }

    const deleted = userModel.delete(id);
    if (!deleted) {
      sendJson(res, 404, { message: "User not found" });
      return;
    }

    res.writeHead(204);
    res.end();
  },
};
