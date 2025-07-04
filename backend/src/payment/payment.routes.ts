import { Router } from "express";
import * as PaymentController from "./payment.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

// Create payment (any authenticated user)
router.post("/", authenticate, authorizeRoles("user", "member", "admin"), PaymentController.createPayment);

// Get all payments (admins only)
router.get("/", authenticate, authorizeRoles("admin"), PaymentController.getAllPayments);

// Get payment by ID (authenticated users)
router.get("/:id", authenticate, authorizeRoles("user", "member", "admin"), PaymentController.getPaymentById);

// Update payment status (admins only)
router.patch("/:id/status", authenticate, authorizeRoles("admin"), PaymentController.updatePaymentStatus);

// Delete payment (admins only)
router.delete("/:id", authenticate, authorizeRoles("admin"), PaymentController.deletePayment);

export default router;
