import { RequestHandler } from "express";
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from "./rooms.service";
import db from "../drizzle/db"; // ✅ DB instance
import { eq } from "drizzle-orm";
import { CreateRoomValidator, UpdateRoomValidator } from "./rooms.validator";

// ✅ GET /api/rooms
export const fetchAllRooms: RequestHandler = async (_req, res) => {
  try {
    const rooms = await getAllRooms();
    res.status(200).json(rooms);
  } catch (err) {
    console.error("❌ Error fetching all rooms:", err);
    res.status(500).json({ message: "Server error fetching rooms." });
  }
  return;
};

// ✅ GET /api/rooms/:id
export const fetchRoomById: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid room ID." });
      return;
    }

    const room = await getRoomById(id);
    if (!room) {
      res.status(404).json({ message: "Room not found." });
      return;
    }

    res.status(200).json(room);
  } catch (err) {
    console.error("❌ Error fetching room by ID:", err);
    res.status(500).json({ message: "Server error fetching room." });
  }
  return;
};

// ✅ POST /api/rooms
export const registerRoom: RequestHandler = async (req, res) => {
  try {
    const parsed = CreateRoomValidator.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const {
      hotelId,
      roomType,
      pricePerNight,
      capacity,
      amenities,
      isAvailable,
      imageUrl,
    } = parsed.data;

    if (!hotelId) {
      res.status(400).json({ message: "hotelId is required." });
      return;
    }

    // ✅ FIXED: Correct Drizzle alias usage!
    const hotel = await db.query.hotels.findFirst({
      where: (hotel) => eq(hotel.hotelId, hotelId),
    });

    if (!hotel) {
      res.status(404).json({ message: "Hotel not found." });
      return;
    }

    const room = await createRoom({
      hotelId,
      roomType,
      pricePerNight: String(pricePerNight),
      capacity,
      amenities,
      isAvailable,
      imageUrl,
    });

    res.status(201).json({ message: "Room created successfully.", room });
  } catch (err) {
    console.error("❌ Error creating room:", err);
    res.status(500).json({ message: "Server error creating room." });
  }
  return;
};

// ✅ PUT /api/rooms/:id
export const modifyRoom: RequestHandler = async (req, res) => {
  try {
    const parsed = UpdateRoomValidator.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const room = await updateRoom(Number(req.params.id), {
      ...parsed.data,
      pricePerNight:
        parsed.data.pricePerNight !== undefined
          ? String(parsed.data.pricePerNight)
          : undefined,
    });

    if (!room) {
      res.status(404).json({ message: "Room not found." });
      return;
    }

    res.status(200).json(room);
  } catch (err) {
    console.error("❌ Error updating room:", err);
    res.status(500).json({ message: "Server error updating room." });
  }
  return;
};

// ✅ DELETE /api/rooms/:id
export const removeRoom: RequestHandler = async (req, res) => {
  try {
    const deleted = await deleteRoom(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ message: "Room not found." });
      return;
    }

    res.status(200).json({ message: "Room deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting room:", err);
    res.status(500).json({ message: "Server error deleting room." });
  }
  return;
};
