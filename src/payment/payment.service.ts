import db from "../drizzle/db";
import { payments, bookings } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { CreatePaymentValidator } from "../payment/payment.validator";
import z from "zod";

// ✅ Create a payment record in your DB
export const createPayment = async (
  data: z.infer<typeof CreatePaymentValidator>
) => {
  const insertData = {
    ...data,
    amount: String(data.amount), // drizzle numeric type expects string
    bookingId: typeof data.bookingId === "string"
      ? Number(data.bookingId)
      : data.bookingId,
  };

  const result = await db.insert(payments).values(insertData).returning();
  return result[0];
};

// ✅ Get all payments
export const getAllPayments = async () => {
  const result = await db.select().from(payments);
  return result;
};

// ✅ Get payment by ID
export const getPaymentById = async (id: number) => {
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.paymentId, id));
  return result[0];
};

// ✅ Update payment status
export const updatePaymentStatus = async (
  id: number,
  status: "Pending" | "Completed" | "Failed"
) => {
  const result = await db
    .update(payments)
    .set({
      paymentStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(payments.paymentId, id))
    .returning();
  return result[0];
};

// ✅ Delete payment
export const deletePayment = async (id: number) => {
  await db.delete(payments).where(eq(payments.paymentId, id));
  return;
};

// ✅ Stripe webhook: mark booking as PAID
export const markBookingAsPaid = async (bookingId: number) => {
  const result = await db
    .update(bookings)
    .set({
      bookingStatus: "Confirmed",
      updatedAt: new Date(),
    })
    .where(eq(bookings.bookingId, bookingId))
    .returning();
  return result[0];
};
