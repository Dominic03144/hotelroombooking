// ✅ src/routes/bookingRoutes.ts

import { Router } from "express";
import {
  createBookingHandler,
  getAllBookingsHandler,
  getMyBookingsHandler,
  getBookingByIdHandler,
  updateBooking,
  confirmBookingHandler,
  cancelBooking,
  deleteBookingHandler,
} from "../booking/booking.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// ✅ Create a booking — must be logged in
router.post("/", authenticate, createBookingHandler);

// ✅ Get all bookings — admin only
router.get("/", authenticate, getAllBookingsHandler);

// ✅ ✅ Specific route FIRST: Get bookings for logged-in user
router.get("/my-bookings", authenticate, getMyBookingsHandler);

// ✅ Then the generic dynamic route
router.get("/:id", authenticate, getBookingByIdHandler);

// ✅ Update booking — user or admin
router.put("/:id", authenticate, updateBooking);

// ✅ Update booking partially — user or admin
router.patch("/:id", authenticate, updateBooking);

// ✅ Confirm booking — admin only
router.patch("/:id/confirm", authenticate, confirmBookingHandler);

// ✅ Cancel booking — user or admin
router.patch("/:id/cancel", authenticate, cancelBooking);

// ✅ Delete booking — user or admin
router.delete("/:id", authenticate, deleteBookingHandler);

export default router;
