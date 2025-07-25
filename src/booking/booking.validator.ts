import { z } from "zod";

// Validator for creating a booking
export const CreateBookingValidator = z.object({
  roomId: z.coerce.number({
    required_error: "Room ID is required",
    invalid_type_error: "Room ID must be a number",
  }),

  checkInDate: z.string()
    .refine((dateStr) => !isNaN(Date.parse(dateStr)), {
      message: "Invalid check-in date",
    }),

  checkOutDate: z.string()
    .refine((dateStr) => !isNaN(Date.parse(dateStr)), {
      message: "Invalid check-out date",
    }),

  totalAmount: z.coerce.number({
    required_error: "Total amount is required",
    invalid_type_error: "Total amount must be a number",
  }).nonnegative("Total amount must be positive"),

  bookingStatus: z.enum(["Pending", "Confirmed", "Cancelled"]).optional(),

  guests: z.coerce.number()
    .min(1, "Guests must be at least 1")
    .optional(),

  specialRequests: z.string()
    .nullable()
    .optional(),
});

// Validator for updating booking status only
export const UpdateBookingValidator = z.object({
  bookingStatus: z.enum(["Pending", "Confirmed", "Cancelled"], {
    required_error: "Booking status is required",
  }),
});
