import { z } from "zod";

export const CreateHotelValidator = z.object({
  hotelName: z.string().min(1, "Hotel name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  location: z.string().min(1, "Location is required"),
  contactPhone: z.string().optional(),
  category: z.string().optional(),
  rating: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : Number(val)))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 0 && val <= 5), {
      message: "Rating must be a number between 0 and 5",
    }),
});
