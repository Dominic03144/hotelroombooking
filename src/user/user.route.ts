import express from "express";
import {
  fetchAllUsers,
  fetchUserById,
  fetchCurrentUser,
  registerUser,
  modifyUser,
  removeUser,
} from "./user.controller";

import { authenticate, isAdmin } from "../middleware/auth.middleware";

const userRouter = express.Router();

// GET /api/users/me - Authenticated user info
userRouter.get("/me", authenticate, fetchCurrentUser);

// GET /api/users - Admin only
userRouter.get("/", authenticate, isAdmin, fetchAllUsers);

// GET /api/users/:id - Admin only
userRouter.get("/:id", authenticate, isAdmin, fetchUserById);

// POST /api/users - Admin creates a new user
userRouter.post("/", authenticate, isAdmin, registerUser);

// PUT /api/users/:id - Admin updates user
userRouter.put("/:id", authenticate, isAdmin, modifyUser);

// PATCH /api/users/:id - Admin partial updates user (optional)
userRouter.patch("/:id", authenticate, isAdmin, modifyUser);

// DELETE /api/users/:id - Admin deletes user
userRouter.delete("/:id", authenticate, isAdmin, removeUser);

// ✅ Export the router properly
export default userRouter;
