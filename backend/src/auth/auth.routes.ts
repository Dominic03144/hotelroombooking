import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

// Controllers (named exports)
import { registerUser } from "./controllers/register.controller";
import { login } from "./controllers/login.controller";
import { verifyEmail, resendVerificationCode } from "./controllers/verify.controller";
import { requestPasswordReset, resetPassword } from "./controllers/password.controller";
import { adminCreateUser } from "./controllers/admin.controller";

const router = Router();

// Public Routes (no auth needed)
router.post("/register", registerUser);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-code", resendVerificationCode);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

// Admin-only route protected by authenticate + authorizeRoles('admin')
function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.post(
  "/admin/create-user",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(adminCreateUser)
);

export default router;
