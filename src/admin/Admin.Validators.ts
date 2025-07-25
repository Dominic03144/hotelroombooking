// ✅ src/validators/admin.validators.ts

import { z } from "zod";

export const AdminCreateUserValidator = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  role: z.string().optional(),
});
