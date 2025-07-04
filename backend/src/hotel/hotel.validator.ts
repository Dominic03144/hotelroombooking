// ✅ hotel.validator.ts
import { z } from "zod";

export const CreateHotelValidator = z.object({
  name: z.string(),
  city: z.string(),
  location: z.string(),
  address: z.string(),
  contactPhone: z.string().optional(),
  category: z.string().optional(),
  rating: z.union([z.string(), z.number()]).optional(),
  imageUrl: z.string().url().optional(),
});

export const UpdateHotelValidator = CreateHotelValidator.partial();

export type CreateHotelInput = z.infer<typeof CreateHotelValidator>;
export type UpdateHotelInput = z.infer<typeof UpdateHotelValidator>;

