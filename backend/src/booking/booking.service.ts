import db from "../drizzle/db";
import { bookings, users, rooms, hotels } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export type BookingStatus = "Pending" | "Confirmed" | "Cancelled";

export interface CreateBookingData {
  userId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: string;
  bookingStatus?: BookingStatus;
}

// Create a new booking
export async function createBooking(
  data: CreateBookingData
): Promise<(typeof bookings.$inferSelect) | null> {
  const [booking] = await db
    .insert(bookings)
    .values({
      ...data,
      bookingStatus: data.bookingStatus ?? "Pending",
    })
    .returning();

  return booking ?? null;
}

// Get booking by ID with joined info
export async function getBookingById(
  bookingId: number
): Promise<
  | {
      bookingId: number;
      checkInDate: string;
      checkOutDate: string;
      totalAmount: string;
      bookingStatus: BookingStatus;
      createdAt: Date | null;
      userFirstName: string;
      userLastName: string;
      userEmail: string;
      hotelName: string;
      roomType: string;
    }
  | null
> {
  const [booking] = await db
    .select({
      bookingId: bookings.bookingId,
      checkInDate: bookings.checkInDate,
      checkOutDate: bookings.checkOutDate,
      totalAmount: bookings.totalAmount,
      bookingStatus: bookings.bookingStatus,
      createdAt: bookings.createdAt,

      userFirstName: users.firstname,
      userLastName: users.lastname,
      userEmail: users.email,

      hotelName: hotels.name,

      roomType: rooms.roomType,
    })
    .from(bookings)
    .innerJoin(users, eq(users.userId, bookings.userId))
    .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
    .innerJoin(hotels, eq(hotels.hotelId, rooms.hotelId))
    .where(eq(bookings.bookingId, bookingId))
    .limit(1);

  return booking ?? null;
}

// Get all bookings for a user with joined info
export async function getBookingsByUserId(
  userId: number
): Promise<
  Array<{
    bookingId: number;
    checkInDate: string;
    checkOutDate: string;
    totalAmount: string;
    bookingStatus: BookingStatus;
    createdAt: string;

    userFirstName: string;
    userLastName: string;
    userEmail: string;

    hotelName: string;

    roomType: string;
  }>
> {
  const results = await db
    .select({
      bookingId: bookings.bookingId,
      checkInDate: bookings.checkInDate,
      checkOutDate: bookings.checkOutDate,
      totalAmount: bookings.totalAmount,
      bookingStatus: bookings.bookingStatus,
      createdAt: bookings.createdAt,

      userFirstName: users.firstname,
      userLastName: users.lastname,
      userEmail: users.email,

      hotelName: hotels.name,

      roomType: rooms.roomType,
    })
    .from(bookings)
    .innerJoin(users, eq(users.userId, bookings.userId))
    .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
    .innerJoin(hotels, eq(hotels.hotelId, rooms.hotelId))
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt));

  return results.map((b) => ({
    ...b,
    createdAt: b.createdAt ? b.createdAt.toISOString() : "",
  }));
}

// Update booking status
export async function updateBookingStatus(
  bookingId: number,
  status: BookingStatus
): Promise<(typeof bookings.$inferSelect) | null> {
  const [booking] = await db
    .update(bookings)
    .set({ bookingStatus: status })
    .where(eq(bookings.bookingId, bookingId))
    .returning();

  return booking ?? null;
}

// Delete booking
export async function deleteBooking(bookingId: number): Promise<boolean> {
  const result = await db.delete(bookings).where(eq(bookings.bookingId, bookingId));
  if (typeof result === "number") {
    return result > 0;
  }
  return (result.rowCount ?? 0) > 0;
}

// Admin: Get all bookings ordered by newest
export async function getAllBookings(): Promise<
  Array<{
    bookingId: number;
    checkInDate: string;
    checkOutDate: string;
    totalAmount: string;
    bookingStatus: BookingStatus;
    createdAt: string;

    userFirstName: string;
    userLastName: string;
    userEmail: string;

    hotelName: string;

    roomType: string;
  }>
> {
  const results = await db
    .select({
      bookingId: bookings.bookingId,
      checkInDate: bookings.checkInDate,
      checkOutDate: bookings.checkOutDate,
      totalAmount: bookings.totalAmount,
      bookingStatus: bookings.bookingStatus,
      createdAt: bookings.createdAt,

      userFirstName: users.firstname,
      userLastName: users.lastname,
      userEmail: users.email,

      hotelName: hotels.name,

      roomType: rooms.roomType,
    })
    .from(bookings)
    .innerJoin(users, eq(users.userId, bookings.userId))
    .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
    .innerJoin(hotels, eq(hotels.hotelId, rooms.hotelId))
    .orderBy(desc(bookings.createdAt));

  return results.map((b) => ({
    ...b,
    createdAt: b.createdAt ? b.createdAt.toISOString() : "",
  }));
}
