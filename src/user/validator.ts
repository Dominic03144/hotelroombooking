import { z } from "zod";

// Role enum matching your schema (including "customer")
const RoleEnum = z.enum(["user", "admin", "owner", "driver", "member", "customer"]);

// Validator for creating a user (all required)
export const CreateUserValidator = z.object({
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  contactPhone: z.string(),
  address: z.string(),
  role: RoleEnum.optional(), // Default to "user" if not provided
});

// Validator for updating a user (all fields optional)
export const UpdateUserValidator = CreateUserValidator.partial();
