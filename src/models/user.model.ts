import { v4 as uuidv4 } from "uuid";

export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

class UserModel {
  private users: User[] = [];

  create(userData: Omit<User, "id">): User {
    const newUser: User = {
      id: uuidv4(),
      ...userData,
    };
    this.users.push(newUser);
    return newUser;
  }

  findAll(): User[] {
    return this.users;
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  update(id: string, userData: Omit<User, "id">): User | null {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return null;

    const updatedUser: User = { id, ...userData };
    this.users[index] = updatedUser;
    return updatedUser;
  }

  delete(id: string): boolean {
    const initialLength = this.users.length;
    this.users = this.users.filter((user) => user.id !== id);
    return this.users.length !== initialLength;
  }

  setState(state: User[]): void {
    this.users = state;
  }

  updateState(key: string, value: User | null): void {
    if (value === null) {
      this.users = this.users.filter((user) => user.id !== key);
    } else {
      const index = this.users.findIndex((user) => user.id === key);
      if (index !== -1) {
        this.users[index] = value;
      } else {
        this.users.push(value);
      }
    }
  }
}

export const userModel = new UserModel();
