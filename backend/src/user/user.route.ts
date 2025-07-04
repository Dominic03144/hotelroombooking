import { Router } from "express";
import {
  fetchAllUsers,
  fetchUserById,
  registerUser,
  modifyUser,
  removeUser,
} from "../user/user.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

// ================================
// 🔐 Admin-only protected routes
// ================================

// ✅ Get all users
router.get("/", authenticate, authorizeRoles("admin"), fetchAllUsers);

// ✅ Get user by ID
router.get("/:id", authenticate, authorizeRoles("admin"), fetchUserById);

// ✅ Create new user (by admin)
router.post("/", authenticate, authorizeRoles("admin"), registerUser);

// ✅ Update user by ID
router.put("/:id", authenticate, authorizeRoles("admin"), modifyUser);

// ✅ Delete user by ID
router.delete("/:id", authenticate, authorizeRoles("admin"), removeUser);

export default router;
