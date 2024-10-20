import { Request, Response } from "express";
import { validate as uuidValidate } from "uuid";
import { userModel, User } from "../models/user.model";

export const userController = {
  getAllUsers: (_req: Request, res: Response) => {
    const users = userModel.findAll();
    res.status(200).json(users);
  },

  getUserById: (req: Request, res: Response) => {
    const { id } = req.params;
    if (!uuidValidate(id)) {
      res.status(400).json({ message: "Invalid user id" });
      return;
    }
    const user = userModel.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  },

  createUser: (req: Request, res: Response) => {
    const { username, age, hobbies } = req.body;
    if (!username || typeof age !== "number" || !Array.isArray(hobbies)) {
      res.status(400).json({ message: "Invalid user data" });
      return;
    }
    const newUser = userModel.create({ username, age, hobbies });
    res.status(201).json(newUser);
  },

  updateUser: (req: Request, res: Response) => {
    const { id } = req.params;
    const { username, age, hobbies } = req.body;
    if (!uuidValidate(id)) {
      res.status(400).json({ message: "Invalid user id" });
      return;
    }
    if (!username || typeof age !== "number" || !Array.isArray(hobbies)) {
      res.status(400).json({ message: "Invalid user data" });
      return;
    }
    const updatedUser = userModel.update(id, { username, age, hobbies });
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(updatedUser);
  },

  deleteUser: (req: Request, res: Response) => {
    const { id } = req.params;
    if (!uuidValidate(id)) {
      res.status(400).json({ message: "Invalid user id" });
      return;
    }
    const deleted = userModel.delete(id);
    if (!deleted) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(204).send();
  },
};
