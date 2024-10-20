import request from "supertest";
import app from "../app";
import { v4 as uuidv4 } from "uuid";
import { userModel } from "../models/user.model";

describe("User API", () => {
  beforeEach(() => {
    userModel["users"] = [];
  });

  describe("GET /api/users", () => {
    it("should return an empty array when no users exist", async () => {
      const res = await request(app).get("/api/users");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should return all users when users exist", async () => {
      userModel.create({
        username: "Test User",
        age: 25,
        hobbies: ["reading"],
      });
      const res = await request(app).get("/api/users");
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
      const res = await request(app).post("/api/users").send(newUser);
      console.log(res);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        ...newUser,
      });
    });

    it("should return 400 if user data is invalid", async () => {
      const invalidUser = { username: "Invalid User" };
      const res = await request(app).post("/api/users").send(invalidUser);
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
      const res = await request(app).get(`/api/users/${user.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(user);
    });

    it("should return 404 if user is not found", async () => {
      const nonExistentId = uuidv4();
      const res = await request(app).get(`/api/users/${nonExistentId}`);
      expect(res.status).toBe(404);
    });

    it("should return 400 if id is not a valid UUID", async () => {
      const res = await request(app).get("/api/users/invalid-id");
      expect(res.status).toBe(400);
    });
  });
});
