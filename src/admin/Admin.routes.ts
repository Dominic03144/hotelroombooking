import { Router } from "express";
import { adminCreateUser } from "./AdminUsers.controller";
import { getAdminOverview } from "./AdminOverview.controller";
import { getAllPayments } from "../payment/payment.controller"; // ✅ import it
import { authenticate, isAdmin } from "../middleware/auth.middleware";
import { getAllPaymentsHandler } from "./adminpayment";

const adminRouter = Router();

// Protect all /api/admin routes
adminRouter.use(authenticate);
adminRouter.use(isAdmin);

// Admin endpoints
adminRouter.post("/users", adminCreateUser);
adminRouter.get("/admin/overview", getAdminOverview);

// ✅ ✅ ✅ ADD THIS:
adminRouter.get("/payments", getAllPaymentsHandler);


export default adminRouter;

