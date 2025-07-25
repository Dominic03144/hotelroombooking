import { z } from "zod";

// =============================
// ✅ Registration Validator
// =============================
export const RegisterValidator = z.object({
  firstname: z.string().min(2, "First name is required"),
  lastname: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(32, "Password too long"),
  contactPhone: z.string().min(7, "Contact phone is required"),
  address: z.string().min(5, "Address is required"),
  profileImageUrl: z.string().url("Invalid image URL").optional(),
  role: z.enum(["user", "admin", "member", "owner", "driver", "customer"]).optional(),
});

// =============================
// ✅ Login Validator
// =============================
export const LoginValidator = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// =============================
// ✅ Verify Email Code Validator
// =============================
export const VerifyEmailValidator = z.object({
  email: z.string().email("Invalid email address"),
  code: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d{6}$/, "Code must be numeric"),
});

// =============================
// ✅ Resend Verification Code Validator
// =============================
export const ResendVerificationValidator = z.object({
  email: z.string().email("Invalid email address"),
});

// =============================
// ✅ Request Password Reset Validator
// =============================
export const RequestResetValidator = z.object({
  email: z.string().email("Invalid email address"),
});

// =============================
// ✅ Reset Password With Code Validator
// =============================
export const ResetPasswordValidator = z.object({
  email: z.string().email("Invalid email address"),
  code: z
    .string()
    .length(6, "Reset code must be 6 digits")
    .regex(/^\d{6}$/, "Code must be numeric"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters long"),
});

// =============================
// ✅ Admin Create User Validator
// =============================
export const AdminCreateUserValidator = z.object({
  firstname: z.string().min(2, "First name is required"),
  lastname: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  contactPhone: z.string().min(7, "Contact phone is required"),
  address: z.string().min(5, "Address is required"),
  profileImageUrl: z.string().url("Invalid image URL").optional(),
  role: z.enum(["admin", "user", "member", "owner", "driver", "customer"]),
});
