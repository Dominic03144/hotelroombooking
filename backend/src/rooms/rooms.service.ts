import db from "../drizzle/db";
import { rooms, hotels } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ✅ Get all rooms
export async function getAllRooms() {
  return await db.select().from(rooms);
}

// ✅ Get room by ID (with hotel name)
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

      // hotel info
      hotelName: hotels.name,
    })
    .from(rooms)
    .leftJoin(hotels, eq(rooms.hotelId, hotels.hotelId))
    .where(eq(rooms.roomId, id));

  return roomWithHotel;
}

// ✅ Create room
export async function createRoom(data: typeof rooms.$inferInsert) {
  const [room] = await db.insert(rooms).values(data).returning();
  return room;
}

// ✅ Update room by ID (number)
export async function updateRoom(id: number, data: Partial<typeof rooms.$inferInsert>) {
  const [room] = await db.update(rooms).set(data).where(eq(rooms.roomId, id)).returning();
  return room;
}

// ✅ Delete room by ID (number)
export async function deleteRoom(id: number) {
  const [room] = await db.delete(rooms).where(eq(rooms.roomId, id)).returning();
  return room;
}
