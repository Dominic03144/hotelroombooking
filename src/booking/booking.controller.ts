import { Request, Response } from "express";
import * as bookingService from "../booking/booking.service";

export interface DecodedToken {
  userId: number;
  email?: string;
  firstname?: string;
}

// ✅ Create booking — POST /
export const createBookingHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      roomId,
      checkInDate,
      checkOutDate,
      guests,
      totalAmount,
      specialRequests,
    } = req.body;

    const user = req.user as DecodedToken;

    if (!user || !user.userId) {
      res.status(401).json({ success: false, message: "Unauthorized user" });
      return;
    }

    if (!roomId || !checkInDate || !checkOutDate || !totalAmount) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    // ✅ Check if user already booked this room
    const alreadyBooked = await bookingService.checkExistingBooking(user.userId, roomId);
    if (alreadyBooked) {
      res.status(400).json({
        success: false,
        message: "You have already booked this room.",
      });
      return;
    }

    const newBooking = await bookingService.createBooking({
      userId: user.userId,
      roomId,
      checkInDate,
      checkOutDate,
      guests: guests ?? 1,
      totalAmount: totalAmount.toString(),
      specialRequests: specialRequests ?? null,
      bookingStatus: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "✅ Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("❌ createBookingHandler error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get all bookings — GET /
export const getAllBookingsHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    const allBookings = await bookingService.getAllBookings();
    res.status(200).json({ success: true, bookings: allBookings });
  } catch (error) {
    console.error("❌ getAllBookingsHandler error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get booking by ID — GET /:id
export const getBookingByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingId = Number(req.params.id);

    if (isNaN(bookingId)) {
      res.status(400).json({ success: false, message: "Invalid booking ID" });
      return;
    }

    const booking = await bookingService.getBookingById(bookingId);

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("❌ getBookingByIdHandler error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get my bookings — GET /my-bookings
export const getMyBookingsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as DecodedToken;

    if (!user || !user.userId) {
      res.status(401).json({ success: false, message: "Unauthorized user" });
      return;
    }

    const myBookings = await bookingService.getBookingsByUserId(user.userId);

    res.status(200).json({ success: true, bookings: myBookings });
  } catch (error) {
    console.error("❌ getMyBookingsHandler error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update booking — PUT/PATCH /:id
export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingId = Number(req.params.id);

    if (isNaN(bookingId)) {
      res.status(400).json({ success: false, message: "Invalid booking ID" });
      return;
    }

    const { checkInDate, checkOutDate, guests, specialRequests } = req.body;

    const updated = await bookingService.updateBooking(bookingId, {
      checkInDate,
      checkOutDate,
      guests,
      specialRequests,
    });

    if (!updated) {
      res.status(404).json({ success: false, message: "Booking not found or unauthorized" });
      return;
    }

    res.status(200).json({ success: true, booking: updated });
  } catch (error) {
    console.error("❌ updateBooking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Confirm booking — PATCH /:id/confirm
export const confirmBookingHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingId = Number(req.params.id);

    if (isNaN(bookingId)) {
      res.status(400).json({ success: false, message: "Invalid booking ID" });
      return;
    }

    const confirmed = await bookingService.updateBookingStatus(bookingId, "Confirmed");

    if (!confirmed) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    res.status(200).json({ success: true, booking: confirmed });
  } catch (error) {
    console.error("❌ confirmBookingHandler error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Cancel booking — PATCH /:id/cancel
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingId = Number(req.params.id);

    if (isNaN(bookingId)) {
      res.status(400).json({ success: false, message: "Invalid booking ID" });
      return;
    }

    const cancelled = await bookingService.updateBookingStatus(bookingId, "Cancelled");

    if (!cancelled) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Booking cancelled" });
  } catch (error) {
    console.error("❌ cancelBooking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Delete booking — DELETE /:id
export const deleteBookingHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingId = Number(req.params.id);

    if (isNaN(bookingId)) {
      res.status(400).json({ success: false, message: "Invalid booking ID" });
      return;
    }

    const deleted = await bookingService.deleteBooking(bookingId);

    if (!deleted) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Booking deleted" });
  } catch (error) {
    console.error("❌ deleteBookingHandler error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
