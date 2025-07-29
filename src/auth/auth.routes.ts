import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

// Controllers
import { registerUser } from "./controllers/register.controller";
import { login } from "./controllers/login.controller";
import { verifyEmail, resendVerificationCode } from "./controllers/verify.controller";
import { requestPasswordReset, resetPassword } from "./controllers/password.controller";
import { adminCreateUser } from "./controllers/admin.controller";

const authRouter = Router();

// Utility wrapper for async route handlers
function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ✅ Public Routes (no auth required)
authRouter.post("/register", registerUser);
authRouter.post("/login", login);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/resend-verification-code", resendVerificationCode);
authRouter.post("/request-password-reset", requestPasswordReset);
authRouter.post("/reset-password", resetPassword);

// ✅ Admin-only Route (must be authenticated & role == "admin")
authRouter.post(
  "/admin/create-user",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(adminCreateUser)
);

export default authRouter;
