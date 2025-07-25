import { Router } from "express";
import { adminCreateUser } from "./AdminUsers.controller";
import { getAdminOverview } from "./AdminOverview.controller";
import { getAllPayments } from "../payment/payment.controller"; // ✅ import it
import { authenticate, isAdmin } from "../middleware/auth.middleware";
import { getAllPaymentsHandler } from "./adminpayment";

export const adminRoutes = Router();

// Protect all /api/admin routes
adminRoutes.use(authenticate);
adminRoutes.use(isAdmin);

// Admin endpoints
adminRoutes.post("/users", adminCreateUser);
adminRoutes.get("/overview", getAdminOverview);

// ✅ ✅ ✅ ADD THIS:
adminRoutes.get("/payments", getAllPaymentsHandler);
