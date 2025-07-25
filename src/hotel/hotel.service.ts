import db from "../drizzle/db";
import { hotels, rooms, bookings } from "../drizzle/schema";
import { eq, and, not, or, sql, inArray } from "drizzle-orm";

// Get all hotels with their rooms
export async function getAllHotelsWithRooms() {
  const hotelList = await db.select().from(hotels);
  const roomList = await db.select().from(rooms);

  return hotelList.map((hotel) => ({
    ...hotel,
    rooms: roomList.filter((room) => room.hotelId === hotel.hotelId),
  }));
}

// Get hotels with available rooms between checkIn and checkOut
export async function getHotelsWithAvailableRooms(checkIn: string, checkOut: string) {
  const bookedRooms = await db
    .select({ roomId: bookings.roomId })
    .from(bookings)
    .where(
      or(
        and(
          sql`${bookings.checkInDate} <= ${checkOut}`,
          sql`${bookings.checkOutDate} >= ${checkIn}`
        )
      )
    );

  const bookedRoomIds = bookedRooms.map((b) => b.roomId);

  const availableRooms = await db
    .select()
    .from(rooms)
    .where(not(inArray(rooms.roomId, bookedRoomIds)));

  const hotelIds = [...new Set(availableRooms.map((r) => r.hotelId))];

  const hotelsList = await db
    .select()
    .from(hotels)
    .where(inArray(hotels.hotelId, hotelIds));

  return hotelsList.map((hotel) => ({
    ...hotel,
    rooms: availableRooms.filter((room) => room.hotelId === hotel.hotelId),
  }));
}

// Get one hotel by ID WITH its rooms
export async function getHotelById(id: string) {
  const [hotel] = await db
    .select()
    .from(hotels)
    .where(eq(hotels.hotelId, Number(id)));

  if (!hotel) return null;

  const hotelRooms = await db
    .select()
    .from(rooms)
    .where(eq(rooms.hotelId, hotel.hotelId));

  return {
    ...hotel,
    rooms: hotelRooms,
  };
}

// Create hotel
export async function createHotel(data: typeof hotels.$inferInsert) {
  const [hotel] = await db.insert(hotels).values(data).returning();
  return hotel;
}

// Update hotel
export async function updateHotel(id: string, data: Partial<typeof hotels.$inferInsert>) {
  const [hotel] = await db
    .update(hotels)
    .set(data)
    .where(eq(hotels.hotelId, Number(id)))
    .returning();
  return hotel;
}

// Delete hotel
export async function deleteHotel(id: string) {
  const [hotel] = await db
    .delete(hotels)
    .where(eq(hotels.hotelId, Number(id)))
    .returning();
  return hotel;
}
