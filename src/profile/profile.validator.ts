// src/profile/profile.validator.ts
import z from "zod";

export const updateProfileSchema = z.object({
  firstname: z.string().min(1).max(100),
  lastname: z.string().min(1).max(100),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
});
