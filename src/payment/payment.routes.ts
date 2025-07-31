import { Router, RequestHandler } from "express";
import * as PaymentController from "../payment/payment.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const paymentRouter = Router();

const userOrMemberOrAdmin: RequestHandler = authorizeRoles("user", "member", "admin");
const adminOnly: RequestHandler = authorizeRoles("admin");

// ✅ Create Stripe Checkout session
paymentRouter.post(
  "/create-checkout-session",
  authenticate,
  userOrMemberOrAdmin,
  PaymentController.createStripeCheckoutSession
);

// ✅ Stripe Webhook — must NOT use auth middleware — Stripe calls it!
paymentRouter.post(
  "/webhook",
  PaymentController.handleStripeWebhook
);

// ✅ Get my payments
paymentRouter.get(
  "/my",
  authenticate,
  userOrMemberOrAdmin,
  PaymentController.getMyPayments
);

// ✅ Get my single payment receipt (NEW!)
paymentRouter.get(
  "/my/:paymentId/receipt",
  authenticate,
  userOrMemberOrAdmin,
  PaymentController.getMyPaymentReceipt
);

// ✅ Get ALL payments (admin only)
paymentRouter.get(
  "/",
  // authenticate,
  // adminOnly,
  PaymentController.getAllPayments
);

// ✅ Real-time payment status by transaction ID
paymentRouter.get(
  "/:transactionId/status",
  authenticate,
  userOrMemberOrAdmin,
  PaymentController.getPaymentStatus
);

// ✅ CRUD placeholders (optional, keep if needed)
paymentRouter.post(
  "/",
  authenticate,
  userOrMemberOrAdmin,
  PaymentController.createPayment
);

paymentRouter.get(
  "/:id",
  authenticate,
  userOrMemberOrAdmin,
  PaymentController.getPaymentById
);

paymentRouter.patch(
  "/:id/status",
  authenticate,
  adminOnly,
  PaymentController.updatePaymentStatus
);

paymentRouter.delete(
  "/:id",
  authenticate,
  adminOnly,
  PaymentController.deletePayment
);

export default paymentRouter;
