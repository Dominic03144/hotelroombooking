import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

// ✅ Import routes
import userRoutes from "./user/user.route";
import authRoutes from "./auth/auth.routes";
import hotelRoutes from "./hotel/hotel.routes";
import roomsRoutes from "./rooms/rooms.routes";
import bookingRoutes from "./booking/booking.routes";
import paymentRoutes from "./payment/payment.routes";
import ticketRoutes from "./tickets/ticket.routes";
import reviewsRoutes from "./reviews/reviews.routes";
import settingsRoutes from "./settings/settings.routes";
import profileRoutes from "./profile/profile.routes";

// ✅ Import admin routes
import { adminRoutes } from "./admin/Admin.routes";

// ✅ Stripe webhook must be raw
import * as paymentController from "./payment/payment.controller";

// ✅ Auth middleware
import { authenticate, isAdmin } from "./middleware/auth.middleware";

const app: Application = express();

/* ----------------------------------------
 ✅ CORS — match your frontend URL + credentials
---------------------------------------- */
app.use(
  cors({
    origin: "https://superb-daffodil-9e6ee1.netlify.app/", // <-- Update this for production!
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

/* ----------------------------------------
 ✅ Parse cookies
---------------------------------------- */
app.use(cookieParser());

/* ----------------------------------------
 ✅ Stripe webhook FIRST — raw body!
---------------------------------------- */
app.post(
  "/api/payments/webhook",
  bodyParser.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook
);

/* ----------------------------------------
 ✅ JSON parser for everything else
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

// Protected user routes
app.use("/api/users", authenticate, userRoutes);

// Auth routes — no auth needed for register/login
app.use("/api/auth", authRoutes);

// Hotels — mostly public
app.use("/api/hotels", hotelRoutes);

// Rooms — mostly public
app.use("/api/rooms", roomsRoutes);

// Bookings — must be authenticated
app.use("/api/bookings", authenticate, bookingRoutes);

// Payments — handled inside, except webhook above
app.use("/api/payments", paymentRoutes);

// Support tickets — must be authenticated
app.use("/api/tickets", authenticate, ticketRoutes);

// Reviews — public or protected
app.use("/api/reviews", reviewsRoutes);

// ✅ Settings — must be authenticated
app.use("/api/settings", authenticate, settingsRoutes);

// ✅ Profile — must be authenticated
app.use("/api/profile", authenticate, profileRoutes);

// Admin routes — must be admin
app.use("/api/admin", authenticate, isAdmin, adminRoutes);

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
