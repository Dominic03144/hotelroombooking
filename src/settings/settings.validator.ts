import { z } from "zod";

export const updateEmailSchema = z.object({
  newEmail: z.string().email(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, "Old password must be at least 6 characters."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});
