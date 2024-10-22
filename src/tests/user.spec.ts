import http from "http";
import { AddressInfo } from "net";
import { userModel } from "../models/user.model";
import { userController } from "../controllers/user.controller";
import { v4 as uuidv4 } from "uuid";

describe("User API", () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll((done) => {
    server = http.createServer((req, res) => {
      userController.handleRequest(req, res);
    });

    server.listen(0, "127.0.0.1", () => {
      const address = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${address.port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    userModel["users"] = [];
  });

  const makeRequest = (
    path: string,
    method: string = "GET",
    body?: any
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const options = {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
      };

      const req = http.request(`${baseUrl}${path}`, options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : undefined,
          });
        });
      });

      req.on("error", reject);

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  describe("GET /api/users", () => {
    it("should return an empty array when no users exist", async () => {
      const res = await makeRequest("/api/users");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should return all users when users exist", async () => {
      userModel.create({
        username: "Test User",
        age: 25,
        hobbies: ["reading"],
      });
      const res = await makeRequest("/api/users");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        id: expect.any(String),
        username: "Test User",
        age: 25,
        hobbies: ["reading"],
      });
    });
  });

  describe("POST /api/users", () => {
    it("should create a new user", async () => {
      const newUser = { username: "New User", age: 30, hobbies: ["sports"] };
      const res = await makeRequest("/api/users", "POST", newUser);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        ...newUser,
      });
    });

    it("should return 400 if user data is invalid", async () => {
      const invalidUser = { username: "Invalid User" };
      const res = await makeRequest("/api/users", "POST", invalidUser);
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return a user if valid id is provided", async () => {
      const user = userModel.create({
        username: "Test User",
        age: 25,
        hobbies: ["reading"],
      });
      const res = await makeRequest(`/api/users/${user.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(user);
    });

    it("should return 404 if user is not found", async () => {
      const nonExistentId = uuidv4();
      const res = await makeRequest(`/api/users/${nonExistentId}`);
      expect(res.status).toBe(404);
    });

    it("should return 400 if id is not a valid UUID", async () => {
      const res = await makeRequest("/api/users/invalid-id");
      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update an existing user", async () => {
      const user = userModel.create({
        username: "Test User",
        age: 25,
        hobbies: ["reading"],
      });
      const updateData = {
        username: "Updated User",
        age: 30,
        hobbies: ["writing"],
      };
      const res = await makeRequest(`/api/users/${user.id}`, "PUT", updateData);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: user.id,
        ...updateData,
      });
    });

    it("should return 404 if user doesn't exist", async () => {
      const nonExistentId = uuidv4();
      const updateData = {
        username: "Updated User",
        age: 30,
        hobbies: ["writing"],
      };
      const res = await makeRequest(
        `/api/users/${nonExistentId}`,
        "PUT",
        updateData
      );
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete an existing user", async () => {
      const user = userModel.create({
        username: "Test User",
        age: 25,
        hobbies: ["reading"],
      });
      const res = await makeRequest(`/api/users/${user.id}`, "DELETE");
      expect(res.status).toBe(204);
    });

    it("should return 404 if user doesn't exist", async () => {
      const nonExistentId = uuidv4();
      const res = await makeRequest(`/api/users/${nonExistentId}`, "DELETE");
      expect(res.status).toBe(404);
    });
  });
});
