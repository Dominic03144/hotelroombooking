// ✅ File: src/app.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';

// ✅ Routes
import userRoutes from './user/user.route';
import authRoutes from './auth/auth.routes';
import hotelRoutes from './hotel/hotel.routes';
import roomsRoutes from './rooms/rooms.routes';
import bookingRoutes from './booking/booking.routes';
import paymentRoutes from './payment/payment.routes';
import ticketRoutes from './tickets/ticket.routes'; // ✅ NEW: Import ticket routes

const app: Application = express();

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json()); // ✅ Must be BEFORE routes

// ========== TEST ROUTE FOR DEBUGGING ==========
app.post("/test-json", (req: Request, res: Response) => {
  console.log("📥 Test JSON body:", req.body);
  res.json({ received: req.body });
});

// ========== ROUTES ==========
app.get("/", (req: Request, res: Response) => {
  res.send("🏨 Welcome to the Hotel Booking System API");
});

app.use("/api/users", userRoutes);        // ✅ User routes
app.use("/api/auth", authRoutes);         // ✅ Authentication
app.use("/api/hotels", hotelRoutes);      // ✅ Hotel routes
app.use("/api/rooms", roomsRoutes);       // ✅ Room routes
app.use("/api/bookings", bookingRoutes);  // ✅ Booking routes
app.use("/api/payment", paymentRoutes);   // ✅ Payment routes
app.use("/api/tickets", ticketRoutes);    // ✅ Ticket support routes

export default app;
