// src/routes/payment.routes.ts (or wherever your payment router is located)

import { Router, RequestHandler } from "express";
import * as PaymentController from "../payment/payment.controller"; // Adjust path as per your project structure
import { authenticate, authorizeRoles } from "../middleware/auth.middleware"; // Adjust path as per your project structure

const paymentRouter = Router();

// Role guards (assuming these are defined in your auth.middleware.ts)
// These functions return Express RequestHandler middleware
const userOrMemberOrAdmin: RequestHandler = authorizeRoles("user", "member", "admin");
const adminOnly: RequestHandler = authorizeRoles("admin");

// IMPORTANT: Ensure your backend server is restarted after making these changes!

// ✅ Create Stripe Checkout session
// This endpoint requires the user to be authenticated and have one of the specified roles.
paymentRouter.post(
  "/create-checkout-session",
  authenticate,          // <-- UNCOMMENTED: Ensures user is logged in and token is valid
  userOrMemberOrAdmin,   // <-- UNCOMMENTED: Ensures logged-in user has 'user', 'member', or 'admin' role
  PaymentController.createStripeCheckoutSession
);

// ✅ Stripe Webhook — public, Stripe calls this, no auth!
// This endpoint is meant to be called by Stripe's servers, so it should NOT have authentication.
paymentRouter.post(
  "/webhook",
  PaymentController.handleStripeWebhook
);

// ✅ Get my payments — allow user, member, admin
paymentRouter.get(
  "/my",
  authenticate,
  userOrMemberOrAdmin,
  PaymentController.getMyPayments
);

// ✅ Get my single payment receipt — same roles
paymentRouter.get(
  "/my/:paymentId/receipt",
  authenticate,
  userOrMemberOrAdmin,
  PaymentController.getMyPaymentReceipt
);

// ✅ Get ALL payments — admin only
paymentRouter.get(
  "/",
  authenticate,
  adminOnly,
  PaymentController.getAllPayments
);

// ✅ Get payment status by transaction ID — user, member, admin
paymentRouter.get(
  "/:transactionId/status",
  authenticate,
  userOrMemberOrAdmin,
  PaymentController.getPaymentStatus
);

// ✅ CRUD placeholders (Admin-only for direct manipulation)
paymentRouter.post(
  "/",
  authenticate,
  adminOnly, // 🔐 Only admin can create manual payments
  PaymentController.createPayment
);

paymentRouter.get(
  "/:id",
  authenticate,
  adminOnly, // 🔐 Only admin can view by ID
  PaymentController.getPaymentById
);

paymentRouter.patch(
  "/:id/status",
  authenticate,
  adminOnly, // 🔐 Only admin can update status
  PaymentController.updatePaymentStatus
);

paymentRouter.delete(
  "/:id",
  authenticate,
  adminOnly, // 🔐 Only admin can delete
  PaymentController.deletePayment
);

export default paymentRouter;