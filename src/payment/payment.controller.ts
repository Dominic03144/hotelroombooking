import Stripe from "stripe";
import { Request, Response } from "express";
import db from "../drizzle/db";
import { payments, bookings } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import * as bookingService from "../booking/booking.service";
import nodemailer from "nodemailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

// ✅ Create Stripe checkout session
export const createStripeCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      res.status(400).json({ error: "Missing bookingId or amount" });
      return;
    }

    const customerEmail = req.user?.email || "";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Hotel Booking #${bookingId}` },
            unit_amount: Number(amount),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
      customer_email: customerEmail,
      metadata: {
        bookingId: bookingId.toString(),
      },
    });

    await db.insert(payments).values({
      bookingId,
      amount: (Number(amount) / 100).toFixed(2),
      paymentStatus: "Pending",
      transactionId: session.id,
      paymentMethod: "card",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe session error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

// ✅ Handle Stripe webhook
export const handleStripeWebhook = async (req: Request, res: Response) => {
  console.log("✅ Webhook received");

  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("✅ Webhook verified:", event.type);
  } catch (err) {
    console.error("❌ Invalid webhook signature:", err);
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      console.error("❌ No bookingId in metadata");
      res.status(400).send("Missing bookingId");
      return;
    }

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, Number(bookingId)));

    if (!payment) {
      console.error(`❌ No payment found for bookingId ${bookingId}`);
      res.status(404).send("Payment not found");
      return;
    }

    let receiptUrl: string | null = null;

    if (session.payment_intent) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent as string,
        { expand: ["charges"] }
      );

      const piWithCharges = paymentIntent as unknown as Stripe.PaymentIntent & {
        charges: Stripe.ApiList<Stripe.Charge>;
      };

      if (piWithCharges.charges?.data?.length) {
        const charge = piWithCharges.charges.data[0];
        receiptUrl = charge?.receipt_url ?? null;
      }
    }

    await bookingService.updateBookingStatus(Number(bookingId), "Confirmed");
    console.log(`✅ Booking ${bookingId} confirmed`);

    await db
      .update(payments)
      .set({
        paymentStatus: "Completed",
        receiptUrl,
      })
      .where(eq(payments.paymentId, payment.paymentId));

    console.log(`✅ Payment ${payment.paymentId} marked Completed`);

    const booking = await bookingService.getBookingById(Number(bookingId));
    if (!booking?.customer?.email) {
      console.error("❌ Booking or customer email missing");
      res.status(400).send("Booking or customer email missing");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.customer.email,
      subject: `Your booking is confirmed!`,
      text: `Hi ${booking.customer.firstname},

Your booking #${bookingId} is confirmed.
Hotel: ${booking.hotelName}
Room: ${booking.roomType}
Check-in: ${booking.checkInDate}
Check-out: ${booking.checkOutDate}

${receiptUrl ? `View your receipt: ${receiptUrl}\n` : ""}

Thank you for booking with us!
Your Hotel Team`,
    });

    console.log(`📧 Confirmation email sent to ${booking.customer.email}`);
  }

  res.json({ received: true });
};

// ✅ Get all payments
export const getAllPayments = async (_req: Request, res: Response) => {
  try {
    const results = await db.select().from(payments);
    res.json(results);
  } catch (error) {
    console.error("❌ Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

// ✅ Get my payments
export const getMyPayments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userPayments = await db
      .select({
        paymentId: payments.paymentId,
        bookingId: payments.bookingId,
        amount: payments.amount,
        paymentStatus: payments.paymentStatus,
        transactionId: payments.transactionId,
        receiptUrl: payments.receiptUrl,
      })
      .from(payments)
      .innerJoin(bookings, eq(payments.bookingId, bookings.bookingId))
      .where(eq(bookings.userId, userId));

    res.json({ payments: userPayments });
  } catch (error) {
    console.error("❌ Error fetching user's payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

// ✅ Get a single payment receipt for the authenticated user
export const getMyPaymentReceipt = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const paymentId = Number(req.params.paymentId);

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!paymentId) {
      res.status(400).json({ error: "Missing paymentId" });
      return;
    }

    const [payment] = await db
      .select({
        paymentId: payments.paymentId,
        bookingId: payments.bookingId,
        amount: payments.amount,
        paymentStatus: payments.paymentStatus,
        transactionId: payments.transactionId,
        receiptUrl: payments.receiptUrl,
      })
      .from(payments)
      .innerJoin(bookings, eq(payments.bookingId, bookings.bookingId))
      .where(
        and(eq(bookings.userId, userId), eq(payments.paymentId, paymentId))
      );

    if (!payment) {
      res.status(404).json({ error: "Payment not found for this user" });
      return;
    }

    res.json({
      paymentId: payment.paymentId,
      receiptUrl: payment.receiptUrl,
    });
  } catch (error) {
    console.error("❌ Error fetching payment receipt:", error);
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
};

// ✅ Get payment status
export const getPaymentStatus = async (req: Request, res: Response) => {
  const { transactionId } = req.params;

  if (!transactionId) {
    res.status(400).json({ error: "Missing transactionId" });
    return;
  }

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.transactionId, transactionId));

  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  const booking = await bookingService.getBookingById(payment.bookingId);
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  res.json({
    transactionId,
    paymentStatus: payment.paymentStatus,
    bookingStatus: booking.bookingStatus,
    receiptUrl: payment.receiptUrl,
  });
};

// ✅ Placeholder CRUD
export const createPayment = (_req: Request, res: Response) => {
  res.json({ message: "Payment created (placeholder)" });
};
export const getPaymentById = (req: Request, res: Response) => {
  res.json({ payment: { id: req.params.id } });
};
export const updatePaymentStatus = (req: Request, res: Response) => {
  res.json({ message: `Payment ${req.params.id} status updated` });
};
export const deletePayment = (req: Request, res: Response) => {
  res.json({ message: `Payment ${req.params.id} deleted` });
};
