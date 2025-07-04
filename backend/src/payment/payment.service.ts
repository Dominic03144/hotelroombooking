import db from "../drizzle/db";
import { payments } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { CreatePaymentValidator } from "../payment/payment.validator";
import z from "zod";

// ✅ Create a payment
export const createPayment = async (data: z.infer<typeof CreatePaymentValidator>) => {
  const insertData = {
    ...data,
    amount: String(data.amount), // drizzle expects string for numeric
    bookingId: typeof data.bookingId === "string" ? Number(data.bookingId) : data.bookingId, // ensure bookingId is a number
  };
  const result = await db.insert(payments).values(insertData).returning();
  return result[0];
};

// ✅ Get all payments
export const getAllPayments = async () => {
  return await db.select().from(payments);
};

// ✅ Get payment by ID (now number)
export const getPaymentById = async (id: number) => {
  const result = await db.select().from(payments).where(eq(payments.paymentId, id));
  return result[0];
};

// ✅ Update payment status (id as number)
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

// ✅ Delete payment by ID (number)
export const deletePayment = async (id: number) => {
  await db.delete(payments).where(eq(payments.paymentId, id));
};
