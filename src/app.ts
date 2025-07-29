import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

// ✅ Stripe webhook must use raw body
import * as paymentController from "./payment/payment.controller";

// ✅ Auth middleware
import { authenticate, isAdmin } from "./middleware/auth.middleware";

// ✅ Routers
import hotelRouter from "./hotel/hotel.routes";
import roomsRouter from "./rooms/rooms.routes";
import bookingRouter from "./booking/booking.routes";
import paymentRouter from "./payment/payment.routes";
import ticketsRouter from "./tickets/ticket.routes";
import reviewRouter from "./reviews/reviews.routes";
import settingsRouter from "./settings/settings.routes";
import profileRouter from "./profile/profile.routes";
import authRouter from "./auth/auth.routes";
import userRouter from "./user/user.route";
import adminRouter from "./admin/Admin.routes";

const app: Application = express();

/* ----------------------------------------
✅ CORS — match your frontend URLs
---------------------------------------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://superb-daffodil-9e6ee1.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

/* ----------------------------------------
✅ Cookie parser
---------------------------------------- */
app.use(cookieParser());

/* ----------------------------------------
✅ Stripe webhook — MUST come before express.json()
---------------------------------------- */
app.post(
  "/api/payments/webhook",
  bodyParser.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook
);

/* ----------------------------------------
✅ Parse JSON body (must come AFTER webhook)
---------------------------------------- */
app.use(express.json());

/* ----------------------------------------
✅ Health check
---------------------------------------- */
app.get("/", (_req: Request, res: Response) => {
  res.send("🏨 Welcome to the Hotel Booking System API");
});

/* ----------------------------------------
✅ Routes
---------------------------------------- */

// Public + Protected Auth routes
app.use("/api/auth", authRouter);

// Public routes
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/reviews", reviewRouter);

// Protected user routes
app.use("/api/users", authenticate, userRouter);
app.use("/api/bookings", authenticate, bookingRouter);
app.use("/api/tickets", authenticate, ticketsRouter);
app.use("/api/settings", authenticate, settingsRouter);
app.use("/api/profile", authenticate, profileRouter);

// Admin-only routes
app.use("/api/admin", authenticate, isAdmin, adminRouter);

// All other payment-related routes
app.use("/api/payments", paymentRouter);

/* ----------------------------------------
✅ Global error handler
---------------------------------------- */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Global error handler:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

export default app;
