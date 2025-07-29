import { Router } from "express";
import {
  fetchAllRooms,
  fetchRoomById,
  registerRoom,
  modifyRoom,
  removeRoom,
} from "./rooms.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const roomsRouter = Router();

// ✅ Public routes (anyone can view rooms)
roomsRouter.get("/", fetchAllRooms);          // GET /api/rooms
roomsRouter.get("/:id", fetchRoomById);       // GET /api/rooms/:id

// ✅ Protected routes — only admin or owner can manage rooms
roomsRouter.post(
  "/",
  authenticate,
  authorizeRoles("admin", "owner"),
  registerRoom
); // POST /api/rooms

roomsRouter.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "owner"),
  modifyRoom
); // PUT /api/rooms/:id

roomsRouter.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin", "owner"),
  removeRoom
); // DELETE /api/rooms/:id

export default roomsRouter;
