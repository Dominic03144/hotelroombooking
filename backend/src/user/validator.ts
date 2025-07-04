import { z } from "zod";

// ✅ Role Enum
const UserRoleEnum = z.enum(["user", "admin"]);

// ===============================
// ✅ Register/Create User Validator
// ===============================
export const CreateUserValidator = z.object({
  firstname: z.string().min(1, "Firstname is required"),
  lastname: z.string().min(1, "Lastname is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(1, "Address is required"),

  // ✅ Allow role only optionally (useful during development)
  role: UserRoleEnum.optional(),
});

// ===============================
// ✅ Update User Validator
// ===============================
export const UpdateUserValidator = z.object({
  firstname: z.string().min(1).optional(),
  lastname: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  contactPhone: z.string().min(10).optional(),
  address: z.string().optional(),
  role: UserRoleEnum.optional(),
});

// ===============================
// ✅ Login Validator
// ===============================
export const LoginValidator = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});
