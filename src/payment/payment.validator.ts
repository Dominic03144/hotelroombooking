import { z } from "zod";

// ✅ Local DB: Create Payment
export const CreatePaymentValidator = z.object({
  bookingId: z.union([z.string().uuid(), z.number()]), // Accept UUID or numeric ID
  amount: z.union([z.string(), z.number()]).refine((val) => Number(val) > 0, {
    message: "Amount must be greater than zero",
  }),
  paymentMethod: z.string().max(50),
  transactionId: z.string().max(100).optional(),
});

// ✅ Local DB: Update Payment Status
export const UpdatePaymentStatusValidator = z.object({
  paymentStatus: z.enum(["Pending", "Completed", "Failed"]),
});

// ✅ Stripe: Create Checkout Session / PaymentIntent
export const CreatePaymentIntentValidator = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).toLowerCase(),
  bookingId: z.union([z.string().uuid(), z.number()]).optional(),
});
