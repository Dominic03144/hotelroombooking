import { RequestHandler, Request, Response } from "express";
import { CreateBookingValidator, UpdateBookingValidator } from "./booking.validator";
import type { DecodedToken } from "../middleware/auth.middleware";
import {
  createBooking,
  getBookingById,
  getBookingsByUserId,
  updateBookingStatus,
  deleteBooking,
  getAllBookings,
} from "./booking.service";
import {
  sendBookingConfirmationEmail,
  sendBookingStatusUpdateEmail,  // <-- import new function here
} from "../middleware/googleMailer";
import db from "../drizzle/db";
import { rooms } from "../drizzle/schema";
import { eq } from "drizzle-orm";

interface AuthRequest extends Request {
  user?: DecodedToken;
}

export const updateBooking: RequestHandler = async (req, res) => {
  try {
    const parse = UpdateBookingValidator.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ errors: parse.error.flatten().fieldErrors });
      return;
    }

    const bookingId = Number(req.params.id);
    if (isNaN(bookingId)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }

    // Update the booking status in DB
    const booking = await updateBookingStatus(bookingId, parse.data.bookingStatus);

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    // Fetch updated booking details for email
    const detailedBooking = await getBookingById(bookingId);

    // If user info exists, send status update email
    if (
      detailedBooking &&
      detailedBooking.userEmail &&
      (detailedBooking.userFirstName || detailedBooking.userLastName)
    ) {
      try {
        const recipientName = detailedBooking.userFirstName
          ? detailedBooking.userFirstName
          : "Valued Customer";

        await sendBookingStatusUpdateEmail(
          detailedBooking.userEmail,
          recipientName,
          bookingId,
          parse.data.bookingStatus
        );
      } catch (emailError) {
        console.error("❌ Error sending booking status update email:", emailError);
      }
    }

    res.json({ message: "Booking updated", booking });
    return;
  } catch (error) {
    console.error("❌ updateBooking error:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};
