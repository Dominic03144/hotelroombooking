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

const bookingRouter = Router();

// ✅ Create a booking — must be logged in
bookingRouter.post("/", authenticate, createBookingHandler);

// ✅ Get all bookings — admin only
bookingRouter.get("/", authenticate, getAllBookingsHandler);

// ✅ ✅ Specific route FIRST: Get bookings for logged-in user
bookingRouter.get("/my-bookings", authenticate, getMyBookingsHandler);

// ✅ Then the generic dynamic route
bookingRouter.get("/:id", authenticate, getBookingByIdHandler);

// ✅ Update booking — user or admin
bookingRouter.put("/:id", authenticate, updateBooking);

// ✅ Update booking partially — user or admin
bookingRouter.patch("/:id", authenticate, updateBooking);

// ✅ Confirm booking — admin only
bookingRouter.patch("/:id/confirm", authenticate, confirmBookingHandler);

// ✅ Cancel booking — user or admin
bookingRouter.patch("/:id/cancel", authenticate, cancelBooking);

// ✅ Delete booking — user or admin
bookingRouter.delete("/:id", authenticate, deleteBookingHandler);

export default bookingRouter;
