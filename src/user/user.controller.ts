import { RequestHandler } from "express";
import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
} from "../user/user.service";

import {
  CreateUserValidator,
  UpdateUserValidator,
} from "../user/validator";

// ✅ GET /api/users
export const fetchAllUsers: RequestHandler = async (_req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
  return;
};

// ✅ GET /api/users/:id
export const fetchUserById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const numericId = Number(id);

  if (!id || isNaN(numericId)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  try {
    const user = await getUserById(numericId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
  return;
};

// ✅ GET /api/users/me
export const fetchCurrentUser: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching current user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
  return;
};

// ✅ POST /api/users
export const registerUser: RequestHandler = async (req, res) => {
  try {
    const parsed = CreateUserValidator.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, role, ...rest } = parsed.data;
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    const safeRole = role === "customer" ? "user" : role ?? "user";

    const newUser = await createUser({
      ...rest,
      email,
      role: safeRole,
    });

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
  return;
};

// ✅ PUT /api/users/:id
export const modifyUser: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const numericId = Number(id);

  if (!id || isNaN(numericId)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  try {
    const parsed = UpdateUserValidator.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const updateData = {
      ...parsed.data,
      role: parsed.data.role === "customer" ? "user" : parsed.data.role ?? "user",
    };

    const updatedUser = await updateUser(numericId, updateData);
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("❌ Error updating user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
  return;
};

// ✅ DELETE /api/users/:id
export const removeUser: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const numericId = Number(id);

  if (!id || isNaN(numericId)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  try {
    const deletedUser = await deleteUser(numericId);
    if (!deletedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
  return;
};
