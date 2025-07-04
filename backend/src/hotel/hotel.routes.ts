import { Router } from "express";
import {
  fetchAllHotels,
  fetchHotelById,
  registerHotel,
  modifyHotel,
  removeHotel,
} from "./hotel.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

/**
 * ✅ Public Routes
 */

// GET /api/hotels
// Supports optional query: 
// ?available=true&checkInDate=YYYY-MM-DD&checkOutDate=YYYY-MM-DD
// - Returns all hotels with their rooms by default
// - Returns only hotels with available rooms in a date range when filtered
router.get("/", fetchAllHotels);

// GET /api/hotels/:id - Get hotel by ID
router.get("/:id", fetchHotelById);

/**
 * ✅ Protected Routes (admin or owner)
 */

// POST /api/hotels - Create hotel
router.post("/", authenticate, authorizeRoles("admin", "owner"), registerHotel);

// PUT /api/hotels/:id - Update hotel
router.put("/:id", authenticate, authorizeRoles("admin"), modifyHotel);

// DELETE /api/hotels/:id - Delete hotel
router.delete("/:id", authenticate, authorizeRoles("admin"), removeHotel);

export default router;
