import { Router } from "express";
import {
  updateBooking,
  getAllBookingsHandler,
  cancelBooking,
  deleteBookingHandler,
} from "./booking.controller"; // ✅ Include all necessary controllers
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

// ✅ Get all bookings (Admin only)
router.get("/all", authenticate, authorizeRoles("admin"), getAllBookingsHandler);

// ✅ Update booking status (Admin only)
router.put("/:id", authenticate, authorizeRoles("admin"), updateBooking);

// ✅ Cancel booking (Admin only)
router.put("/:id/cancel", authenticate, authorizeRoles("admin"), cancelBooking);

// ✅ Delete booking (Admin only)
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteBookingHandler);

export default router;
