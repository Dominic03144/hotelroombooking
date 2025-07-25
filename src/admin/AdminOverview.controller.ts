// ✅ src/controllers/admin.controller.ts

import { Request, Response } from "express";
import db from "../drizzle/db";
import {
  users,
  hotels,
  rooms,
  bookings,
  payments,
  tickets,
  reviews,
} from "../drizzle/schema";
import { count, eq, sum, and, gte, lte, sql } from "drizzle-orm";

export const getAdminOverview = async (req: Request, res: Response) => {
  try {
    // ✅ Count all users
    const [totalUsers] = await db.select({ count: count() }).from(users);

    // ✅ Verified users only
    const [verifiedUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isVerified, true));

    // ✅ Hotels, Rooms
    const [totalHotels] = await db.select({ count: count() }).from(hotels);
    const [totalRooms] = await db.select({ count: count() }).from(rooms);

    // ✅ BOOKINGS: Count only confirmed
    const [totalBookings] = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.bookingStatus, "Confirmed"));

    // ✅ Upcoming confirmed bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    const [upcomingBookings] = await db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.bookingStatus, "Confirmed"),
          gte(bookings.checkInDate, todayStr)
        )
      );

    // ✅ REVENUE: Only completed payments
    const [totalRevenueRow] = await db
      .select({ totalRevenue: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.paymentStatus, "Completed"));
    const totalRevenue = totalRevenueRow.totalRevenue || 0;

    // ✅ Pending payments
    const [pendingPaymentsRow] = await db
      .select({ count: count() })
      .from(payments)
      .where(eq(payments.paymentStatus, "Pending"));
    const pendingPayments = pendingPaymentsRow.count;

    // ✅ Open tickets
    const [openTicketsRow] = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.status, "Open"));
    const openTickets = openTicketsRow.count;

    // ✅ Total reviews
    const [totalReviews] = await db.select({ count: count() }).from(reviews);

    // ✅ BOOKINGS trend — last 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

    const bookingsTrendRaw = await db
      .select({
        date: sql`date_trunc('day', ${bookings.checkInDate})::date`.as("date"),
        bookings: count(),
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.bookingStatus, "Confirmed"),
          gte(bookings.checkInDate, sevenDaysAgoStr),
          lte(bookings.checkInDate, todayStr)
        )
      )
      .groupBy(sql`date_trunc('day', ${bookings.checkInDate})`)
      .orderBy(sql`date_trunc('day', ${bookings.checkInDate})`);

    const bookingsTrend = fillMissingDates(
      sevenDaysAgo,
      today,
      bookingsTrendRaw,
      "bookings"
    );

    // ✅ REVENUE trend — last 7 days
    const revenueTrendRaw = await db
      .select({
        date: sql`date_trunc('day', ${payments.paymentDate})::date`.as("date"),
        revenue: sum(payments.amount),
      })
      .from(payments)
      .where(
        and(
          eq(payments.paymentStatus, "Completed"),
          gte(payments.paymentDate, sevenDaysAgo),
          lte(payments.paymentDate, today)
        )
      )
      .groupBy(sql`date_trunc('day', ${payments.paymentDate})`)
      .orderBy(sql`date_trunc('day', ${payments.paymentDate})`);

    const revenueTrend = fillMissingDates(
      sevenDaysAgo,
      today,
      revenueTrendRaw,
      "revenue"
    );

    // ✅ Return final response with filled trends
    res.json({
      totalUsers: Number(totalUsers.count),
      verifiedUsers: Number(verifiedUsers.count),
      totalHotels: Number(totalHotels.count),
      totalRooms: Number(totalRooms.count),
      totalBookings: Number(totalBookings.count),
      upcomingBookings: Number(upcomingBookings.count),
      totalRevenue: Number(totalRevenue),
      pendingPayments: Number(pendingPayments),
      openTickets: Number(openTickets),
      totalReviews: Number(totalReviews.count),
      bookingsTrend,
      revenueTrend,
    });
  } catch (error) {
    console.error("❌ Error fetching admin overview:", error);
    res.status(500).json({ error: "Failed to fetch overview" });
  }
};

// ✅ Safe helper to fill missing dates
function fillMissingDates(
  start: Date,
  end: Date,
  data: { date: unknown; [key: string]: any }[],
  valueKey: string
) {
  const map = new Map<string, number>();

  data.forEach((row) => {
    const dateObj = new Date(row.date as string);
    if (isNaN(dateObj.getTime())) return; // skip bad dates
    const dateStr = dateObj.toISOString().slice(0, 10);
    map.set(dateStr, Number(row[valueKey]) || 0);
  });

  const filled = [];
  const current = new Date(start);

  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);
    filled.push({
      date: dateStr,
      [valueKey]: map.get(dateStr) || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return filled;
}
