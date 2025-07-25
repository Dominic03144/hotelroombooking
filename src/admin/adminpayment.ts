import { Request, Response } from "express";
import db from "../drizzle/db";
import { payments, bookings, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const getAllPaymentsHandler = async (req: Request, res: Response) => {
  try {
    const results = await db
      .select({
        paymentId: payments.paymentId,          // ✅ correct column
        amount: payments.amount,
        paymentStatus: payments.paymentStatus,  // ✅ correct column
        paymentMethod: payments.paymentMethod,
        createdAt: payments.createdAt,
        bookingId: bookings.bookingId,          // ✅ correct column
        userEmail: users.email,
        userName: users.firstname,
      })
      .from(payments)
      .leftJoin(bookings, eq(payments.bookingId, bookings.bookingId))
      .leftJoin(users, eq(bookings.userId, users.userId)); // ✅ correct join

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong fetching payments" });
  }
};
