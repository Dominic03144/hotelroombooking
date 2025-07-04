import { Router } from "express";
import {
  fetchAllRooms,
  fetchRoomById,
  registerRoom,
  modifyRoom,
  removeRoom,
} from "./rooms.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

// 🔓 Public routes to view rooms
router.get("/", fetchAllRooms);          // GET /api/rooms
router.get("/:id", fetchRoomById);       // GET /api/rooms/:id

// 🔐 Protected routes (admin and owner only)
router.post("/", authenticate, authorizeRoles("admin", "owner"), registerRoom);     // POST /api/rooms
router.put("/:id", authenticate, authorizeRoles("admin", "owner"), modifyRoom);     // PUT /api/rooms/:id
router.delete("/:id", authenticate, authorizeRoles("admin", "owner"), removeRoom);  // DELETE /api/rooms/:id

export default router;
