import db from "../drizzle/db";
import { bookings, users, rooms, hotels } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export type BookingStatus = "Pending" | "Confirmed" | "Cancelled";

/**
 * ✅ Check if the user has already booked the same room
 */
export async function checkExistingBooking(userId: number, roomId: number) {
  const existing = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.userId, userId), eq(bookings.roomId, roomId)))
    .limit(1);

  return existing.length > 0;
}

/**
 * ✅ Create a new booking — with `bookingStatus: "Pending"` always
 */
export async function createBooking(data: {
  userId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: string;
  guests: number;
  specialRequests?: string | null;
  bookingStatus: BookingStatus; // ✅ include status in type
}) {
  const [newBooking] = await db
    .insert(bookings)
    .values({
      userId: data.userId,
      roomId: data.roomId,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      totalAmount: data.totalAmount,
      guests: data.guests,
      specialRequests: data.specialRequests ?? null,
      bookingStatus: data.bookingStatus, // ✅ insert the status!
    })
    .returning();

  if (!newBooking) return null;

  return {
    ...newBooking,
    totalAmount: Number(newBooking.totalAmount), // ✅ ensure number
  };
}

/**
 * ✅ Get a single booking by ID
 */
export async function getBookingById(bookingId: number) {
  const [row] = await db
    .select({
      bookingId: bookings.bookingId,
      checkInDate: bookings.checkInDate,
      checkOutDate: bookings.checkOutDate,
      bookingStatus: bookings.bookingStatus,
      totalAmount: bookings.totalAmount,
      guests: bookings.guests,

      customer_user_id: users.userId,
      customer_firstname: users.firstname,
      customer_lastname: users.lastname,
      customer_email: users.email,

      roomId: rooms.roomId,
      roomType: rooms.roomType,

      hotelId: hotels.hotelId,
      hotelName: hotels.hotelName,
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.userId, users.userId))
    .leftJoin(rooms, eq(bookings.roomId, rooms.roomId))
    .leftJoin(hotels, eq(rooms.hotelId, hotels.hotelId))
    .where(eq(bookings.bookingId, bookingId));

  if (!row) return null;

  return {
    bookingId: row.bookingId,
    checkInDate: row.checkInDate,
    checkOutDate: row.checkOutDate,
    bookingStatus: row.bookingStatus,
    totalAmount: Number(row.totalAmount),
    guests: row.guests,
    customer: {
      userId: row.customer_user_id,
      firstname: row.customer_firstname,
      lastname: row.customer_lastname,
      email: row.customer_email,
    },
    roomId: row.roomId,
    roomType: row.roomType,
    hotelId: row.hotelId,
    hotelName: row.hotelName,
  };
}

/**
 * ✅ Get all bookings (Admin)
 */
export async function getAllBookings() {
  const rows = await db
    .select({
      bookingId: bookings.bookingId,
      checkInDate: bookings.checkInDate,
      checkOutDate: bookings.checkOutDate,
      bookingStatus: bookings.bookingStatus,
      totalAmount: bookings.totalAmount,
      guests: bookings.guests,

      customer_user_id: users.userId,
      customer_firstname: users.firstname,
      customer_lastname: users.lastname,
      customer_email: users.email,

      roomId: rooms.roomId,
      roomType: rooms.roomType,

      hotelId: hotels.hotelId,
      hotelName: hotels.hotelName,
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.userId, users.userId))
    .leftJoin(rooms, eq(bookings.roomId, rooms.roomId))
    .leftJoin(hotels, eq(rooms.hotelId, hotels.hotelId));

  return rows.map((row) => ({
    bookingId: row.bookingId,
    checkInDate: row.checkInDate,
    checkOutDate: row.checkOutDate,
    bookingStatus: row.bookingStatus,
    totalAmount: Number(row.totalAmount),
    guests: row.guests,
    customer: {
      userId: row.customer_user_id,
      firstname: row.customer_firstname,
      lastname: row.customer_lastname,
      email: row.customer_email,
    },
    roomId: row.roomId,
    roomType: row.roomType,
    hotelId: row.hotelId,
    hotelName: row.hotelName,
  }));
}

/**
 * ✅ Get bookings for a specific user
 */
export async function getBookingsByUserId(userId: number) {
  const rows = await db
    .select({
      bookingId: bookings.bookingId,
      checkInDate: bookings.checkInDate,
      checkOutDate: bookings.checkOutDate,
      bookingStatus: bookings.bookingStatus,
      totalAmount: bookings.totalAmount,
      guests: bookings.guests,

      customer_user_id: users.userId,
      customer_firstname: users.firstname,
      customer_lastname: users.lastname,
      customer_email: users.email,

      roomId: rooms.roomId,
      roomType: rooms.roomType,

      hotelId: hotels.hotelId,
      hotelName: hotels.hotelName,
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.userId, users.userId))
    .leftJoin(rooms, eq(bookings.roomId, rooms.roomId))
    .leftJoin(hotels, eq(rooms.hotelId, hotels.hotelId))
    .where(eq(bookings.userId, userId));

  return rows.map((row) => ({
    bookingId: row.bookingId,
    checkInDate: row.checkInDate,
    checkOutDate: row.checkOutDate,
    bookingStatus: row.bookingStatus,
    totalAmount: Number(row.totalAmount),
    guests: row.guests,
    customer: {
      userId: row.customer_user_id,
      firstname: row.customer_firstname,
      lastname: row.customer_lastname,
      email: row.customer_email,
    },
    roomId: row.roomId,
    roomType: row.roomType,
    hotelId: row.hotelId,
    hotelName: row.hotelName,
  }));
}

/**
 * ✅ Update booking status
 */
export async function updateBookingStatus(
  bookingId: number,
  status: BookingStatus
) {
  const [updated] = await db
    .update(bookings)
    .set({
      bookingStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(bookings.bookingId, bookingId))
    .returning();

  return updated
    ? {
        ...updated,
        totalAmount: Number(updated.totalAmount),
      }
    : null;
}

/**
 * ✅ Update booking details
 */
export async function updateBooking(
  bookingId: number,
  updates: {
    checkInDate?: string;
    checkOutDate?: string;
    guests?: number;
    specialRequests?: string | null;
  }
) {
  const [updated] = await db
    .update(bookings)
    .set({
      checkInDate: updates.checkInDate,
      checkOutDate: updates.checkOutDate,
      guests: updates.guests,
      specialRequests: updates.specialRequests ?? null,
      updatedAt: new Date(),
    })
    .where(eq(bookings.bookingId, bookingId))
    .returning();

  return updated
    ? {
        ...updated,
        totalAmount: Number(updated.totalAmount),
      }
    : null;
}

/**
 * ✅ Delete a booking
 */
export async function deleteBooking(bookingId: number) {
  const [deleted] = await db
    .delete(bookings)
    .where(eq(bookings.bookingId, bookingId))
    .returning();

  return deleted ?? null;
}
