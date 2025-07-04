import db from "../drizzle/db";
import { hotels, rooms, bookings } from "../drizzle/schema";
import { eq, and, or, lte, gte, not, inArray } from "drizzle-orm";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type NewHotel = InferInsertModel<typeof hotels>;
export type Hotel = InferSelectModel<typeof hotels>;
export type Room = InferSelectModel<typeof rooms>;

// Get all hotels with their rooms
export async function getAllHotelsWithRooms(): Promise<(Hotel & { rooms: Room[] })[]> {
  const result = await db
    .select({
      hotelId: hotels.hotelId,
      name: hotels.name,
      city: hotels.city,
      location: hotels.location,
      address: hotels.address,
      contactPhone: hotels.contactPhone,
      category: hotels.category,
      rating: hotels.rating,
      imageUrl: hotels.imageUrl,
      createdAt: hotels.createdAt,
      updatedAt: hotels.updatedAt,

      roomId: rooms.roomId,
      roomType: rooms.roomType,
      pricePerNight: rooms.pricePerNight,
      capacity: rooms.capacity,
      roomImageUrl: rooms.imageUrl,
      amenities: rooms.amenities,
      isAvailable: rooms.isAvailable,
    })
    .from(hotels)
    .innerJoin(rooms, eq(hotels.hotelId, rooms.hotelId));

  const hotelMap: Record<number, Hotel & { rooms: Room[] }> = {};

  for (const row of result) {
    const hotelId = row.hotelId;
    if (!hotelMap[hotelId]) {
      hotelMap[hotelId] = {
        hotelId: row.hotelId,
        name: row.name || "",
        city: row.city || "",
        location: row.location || "",
        address: row.address || "",
        contactPhone: row.contactPhone || "",
        category: row.category || "",
        rating: row.rating || "",
        imageUrl: row.imageUrl || "",
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        rooms: [],
      };
    }

    hotelMap[hotelId].rooms.push({
      roomId: row.roomId,
      roomType: row.roomType || "",
      pricePerNight: row.pricePerNight,
      capacity: row.capacity,
      imageUrl: row.roomImageUrl || "",
      amenities: row.amenities || "",
      isAvailable: row.isAvailable,
      hotelId: hotelId,
      createdAt: null,
      updatedAt: null,
    });
  }

  return Object.values(hotelMap);
}

// Get hotels with available rooms between date range
export async function getHotelsWithAvailableRooms(
  checkInDate: string,
  checkOutDate: string
): Promise<(Hotel & { availableRooms: Room[] })[]> {
  const conflictingRoomIds = await db
    .select({ roomId: bookings.roomId })
    .from(bookings)
    .where(
      or(
        and(
          lte(bookings.checkInDate, checkOutDate),
          gte(bookings.checkOutDate, checkInDate)
        )
      )
    );

  const excludedRoomIds = conflictingRoomIds.map((b) => b.roomId);

  const result = await db
    .select({
      hotelId: hotels.hotelId,
      name: hotels.name,
      city: hotels.city,
      location: hotels.location,
      address: hotels.address,
      contactPhone: hotels.contactPhone,
      category: hotels.category,
      rating: hotels.rating,
      imageUrl: hotels.imageUrl,
      createdAt: hotels.createdAt,
      updatedAt: hotels.updatedAt,

      roomId: rooms.roomId,
      roomType: rooms.roomType,
      pricePerNight: rooms.pricePerNight,
      capacity: rooms.capacity,
      roomImageUrl: rooms.imageUrl,
      amenities: rooms.amenities,
      isAvailable: rooms.isAvailable,
    })
    .from(rooms)
    .leftJoin(hotels, eq(rooms.hotelId, hotels.hotelId))
    .where(
      and(
        eq(rooms.isAvailable, true),
        ...(excludedRoomIds.length > 0
          ? [not(inArray(rooms.roomId, excludedRoomIds))]
          : [])
      )
    );

  const hotelMap: Record<number, Hotel & { availableRooms: Room[] }> = {};

  for (const row of result) {
    const hotelId = row.hotelId;
    if (hotelId !== null && hotelId !== undefined) {
      if (!hotelMap[hotelId]) {
        hotelMap[hotelId] = {
          hotelId: row.hotelId!,
          name: row.name || "",
          city: row.city || "",
          location: row.location || "",
          address: row.address || "",
          contactPhone: row.contactPhone || "",
          category: row.category || "",
          rating: row.rating || "",
          imageUrl: row.imageUrl || "",
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          availableRooms: [],
        };
      }

      if (row.roomId !== null) {
        hotelMap[hotelId].availableRooms.push({
          roomId: row.roomId,
          roomType: row.roomType || "",
          pricePerNight: row.pricePerNight,
          capacity: row.capacity,
          imageUrl: row.roomImageUrl || "",
          amenities: row.amenities || "",
          isAvailable: row.isAvailable,
          hotelId: hotelId,
          createdAt: null,
          updatedAt: null,
        });
      }
    }
  }

  return Object.values(hotelMap);
}

// Get hotel by ID including rooms
export async function getHotelById(
  id: string
): Promise<(Hotel & { rooms: Room[] }) | undefined> {
  const hotelIdNum = Number(id);
  if (isNaN(hotelIdNum)) return undefined;

  // Get hotel info by id
  const [hotel] = await db
    .select()
    .from(hotels)
    .where(eq(hotels.hotelId, hotelIdNum));

  if (!hotel) return undefined;

  // Get rooms for that hotel id
  const hotelRooms = await db.select().from(rooms).where(eq(rooms.hotelId, hotelIdNum));

  return {
    ...hotel,
    rooms: hotelRooms,
  };
}

// Create new hotel
export async function createHotel(data: NewHotel): Promise<Hotel> {
  const now = new Date();
  const [hotel] = await db
    .insert(hotels)
    .values({
      ...data,
      rating: data.rating ?? "0.0",
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return hotel;
}

// Update hotel by ID
export async function updateHotel(
  id: string,
  data: Partial<NewHotel>
): Promise<Hotel | null> {
  const now = new Date();
  const hotelIdNum = Number(id);
  if (isNaN(hotelIdNum)) return null;

  const [updated] = await db
    .update(hotels)
    .set({ ...data, updatedAt: now })
    .where(eq(hotels.hotelId, hotelIdNum))
    .returning();

  return updated ?? null;
}

// Delete hotel by ID
export async function deleteHotel(id: string): Promise<boolean> {
  const hotelIdNum = Number(id);
  if (isNaN(hotelIdNum)) return false;

  const result = await db.delete(hotels).where(eq(hotels.hotelId, hotelIdNum));

  return (result.rowCount ?? 0) > 0;
}
