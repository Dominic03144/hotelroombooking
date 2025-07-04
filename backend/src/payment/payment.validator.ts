// validators/payment.validator.ts
import { z } from "zod";

export const CreatePaymentValidator = z.object({
  bookingId: z.string().uuid(),
  amount: z.string().or(z.number()),
  paymentMethod: z.string().max(50),
  transactionId: z.string().max(100).optional(),
});

export const UpdatePaymentStatusValidator = z.object({
  paymentStatus: z.enum(["Pending", "Completed", "Failed"]),
});
