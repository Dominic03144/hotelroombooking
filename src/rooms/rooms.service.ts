import db from "../drizzle/db";
import { rooms, hotels } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * ✅ Get all rooms with hotel info
 */
export async function getAllRooms() {
  const results = await db
    .select({
      roomId: rooms.roomId,
      roomType: rooms.roomType,
      pricePerNight: rooms.pricePerNight,
      capacity: rooms.capacity,
      amenities: rooms.amenities,
      isAvailable: rooms.isAvailable,
      imageUrl: rooms.imageUrl,
      hotelId: rooms.hotelId,

      hotelName: hotels.hotelName,
      hotelLocation: hotels.location,
      hotelCity: hotels.city,
      hotelAddress: hotels.address,
      hotelContactPhone: hotels.contactPhone,
    })
    .from(rooms)
    .leftJoin(hotels, eq(rooms.hotelId, hotels.hotelId));

  return results;
}

/**
 * ✅ Get a single room by ID with hotel info
 */
export async function getRoomById(id: number) {
  const [roomWithHotel] = await db
    .select({
      roomId: rooms.roomId,
      roomType: rooms.roomType,
      pricePerNight: rooms.pricePerNight,
      capacity: rooms.capacity,
      amenities: rooms.amenities,
      isAvailable: rooms.isAvailable,
      imageUrl: rooms.imageUrl,
      hotelId: rooms.hotelId,

      hotelName: hotels.hotelName,
      hotelLocation: hotels.location,
      hotelCity: hotels.city,
      hotelAddress: hotels.address,
      hotelContactPhone: hotels.contactPhone,
    })
    .from(rooms)
    .leftJoin(hotels, eq(rooms.hotelId, hotels.hotelId))
    .where(eq(rooms.roomId, id));

  return roomWithHotel ?? null;
}

/**
 * ✅ Create a new room
 */
export async function createRoom(data: typeof rooms.$inferInsert) {
  const [room] = await db.insert(rooms).values(data).returning();
  return room ?? null;
}

/**
 * ✅ Update a room by ID
 */
export async function updateRoom(id: number, data: Partial<typeof rooms.$inferInsert>) {
  const [room] = await db
    .update(rooms)
    .set(data)
    .where(eq(rooms.roomId, id))
    .returning();
  return room ?? null;
}

/**
 * ✅ Delete a room by ID
 */
export async function deleteRoom(id: number) {
  const [room] = await db
    .delete(rooms)
    .where(eq(rooms.roomId, id))
    .returning();
  return room ?? null;
}
