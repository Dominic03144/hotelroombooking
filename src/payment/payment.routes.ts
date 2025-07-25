import { Router, RequestHandler } from "express";
import * as PaymentController from "../payment/payment.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

const userOrMemberOrAdmin: RequestHandler = authorizeRoles("user", "member", "admin");
const adminOnly: RequestHandler = authorizeRoles("admin");

// ✅ Create Stripe Checkout session
router.post(
  "/create-checkout-session",
  authenticate,
  userOrMemberOrAdmin,
  PaymentController.createStripeCheckoutSession
);

// ✅ Stripe Webhook — must NOT use auth middleware — Stripe calls it!
router.post(
  "/webhook",
  PaymentController.handleStripeWebhook
);

// ✅ Get my payments
router.get(
  "/my",
  authenticate,
  userOrMemberOrAdmin,
  PaymentController.getMyPayments
);

// ✅ Get my single payment receipt (NEW!)
router.get(
  "/my/:paymentId/receipt",
  authenticate,
  userOrMemberOrAdmin,
  PaymentController.getMyPaymentReceipt
);

// ✅ Get ALL payments (admin only)
router.get(
  "/",
  authenticate,
  adminOnly,
  PaymentController.getAllPayments
);

// ✅ Real-time payment status by transaction ID
router.get(
  "/:transactionId/status",
  authenticate,
  userOrMemberOrAdmin,
  PaymentController.getPaymentStatus
);

// ✅ CRUD placeholders (optional, keep if needed)
router.post(
  "/",
  authenticate,
  userOrMemberOrAdmin,
  PaymentController.createPayment
);

router.get(
  "/:id",
  authenticate,
  userOrMemberOrAdmin,
  PaymentController.getPaymentById
);

router.patch(
  "/:id/status",
  authenticate,
  adminOnly,
  PaymentController.updatePaymentStatus
);

router.delete(
  "/:id",
  authenticate,
  adminOnly,
  PaymentController.deletePayment
);

export default router;
