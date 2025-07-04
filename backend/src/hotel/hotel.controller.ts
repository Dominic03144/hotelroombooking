import { RequestHandler } from "express";
import {
  getAllHotelsWithRooms,
  getHotelsWithAvailableRooms,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} from "./hotel.service";
import {
  CreateHotelValidator,
  UpdateHotelValidator,
} from "./hotel.validator";

// GET /api/hotels?available=true&checkInDate=...&checkOutDate=...
export const fetchAllHotels: RequestHandler = async (req, res) => {
  try {
    const { available, checkInDate, checkOutDate } = req.query;

    if (
      available === "true" &&
      typeof checkInDate === "string" &&
      typeof checkOutDate === "string"
    ) {
      const hotels = await getHotelsWithAvailableRooms(checkInDate, checkOutDate);
      res.json(hotels);
      return;
    }

    const hotels = await getAllHotelsWithRooms();
    res.json(hotels);
  } catch (err) {
    console.error("❌ Error fetching hotels:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /api/hotels/:id
export const fetchHotelById: RequestHandler = async (req, res) => {
  try {
    const hotel = await getHotelById(req.params.id);
    if (!hotel) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }
    res.json(hotel);
  } catch (err) {
    console.error("❌ Error fetching hotel:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST /api/hotels
export const registerHotel: RequestHandler = async (req, res) => {
  try {
    const parse = CreateHotelValidator.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ errors: parse.error.flatten().fieldErrors });
      return;
    }

    const hotel = await createHotel({
      ...parse.data,
      rating: parse.data.rating !== undefined ? String(parse.data.rating) : undefined,
    });

    res.status(201).json({
      message: "Hotel created successfully",
      hotel,
    });
  } catch (err) {
    console.error("❌ Error creating hotel:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// PUT /api/hotels/:id
export const modifyHotel: RequestHandler = async (req, res) => {
  try {
    const parse = UpdateHotelValidator.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ errors: parse.error.flatten().fieldErrors });
      return;
    }

    const hotel = await updateHotel(req.params.id, {
      ...parse.data,
      rating: parse.data.rating !== undefined ? String(parse.data.rating) : undefined,
    });

    if (!hotel) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }

    res.json(hotel);
  } catch (err) {
    console.error("❌ Error updating hotel:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE /api/hotels/:id
export const removeHotel: RequestHandler = async (req, res) => {
  try {
    const deleted = await deleteHotel(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }
    res.json({ message: "Hotel deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting hotel:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
