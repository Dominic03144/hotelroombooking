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

const router = express.Router();

// GET /api/users/me - Authenticated user info
router.get("/me", authenticate, fetchCurrentUser);

// GET /api/users - Admin only
router.get("/", authenticate, isAdmin, fetchAllUsers);

// GET /api/users/:id - Admin only
router.get("/:id", authenticate, isAdmin, fetchUserById);

// POST /api/users - Admin creates a new user
router.post("/", authenticate, isAdmin, registerUser);

// PUT /api/users/:id - Admin updates user
router.put("/:id", authenticate, isAdmin, modifyUser);

// PATCH /api/users/:id - Admin partial updates user (optional)
router.patch("/:id", authenticate, isAdmin, modifyUser);

// DELETE /api/users/:id - Admin deletes user
router.delete("/:id", authenticate, isAdmin, removeUser);

// ✅ Export the router properly
export default router;
