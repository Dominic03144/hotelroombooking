import { RequestHandler, Request } from "express";
import {
  getAllHotelsWithRooms,
  getHotelsWithAvailableRooms,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} from "./hotel.service";
import { CreateHotelValidator } from "./hotel.validator";
import db from "../drizzle/db";
import { reviews } from "../drizzle/schema";
import { eq } from "drizzle-orm";

interface MulterRequest extends Request {
  file?: Express.Multer.File & { path?: string };
}

// -------------------------
// GET /api/hotels
export const fetchAllHotels: RequestHandler = async (req, res) => {
  try {
    console.log("✅ [fetchAllHotels] Query:", req.query);

    const { available, checkInDate, checkOutDate } = req.query;

    if (
      available === "true" &&
      typeof checkInDate === "string" &&
      typeof checkOutDate === "string"
    ) {
      const hotels = await getHotelsWithAvailableRooms(checkInDate, checkOutDate);
      console.log("✅ [fetchAllHotels] Available hotels:", hotels.length);
      res.json(hotels);
      return;
    }

    const hotels = await getAllHotelsWithRooms();
    console.log("✅ [fetchAllHotels] All hotels:", hotels.length);
    res.json(hotels);
    return;
  } catch (err) {
    console.error("❌ [fetchAllHotels] Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

// -------------------------
// GET /api/hotels/:id
export const fetchHotelById: RequestHandler = async (req, res) => {
  try {
    console.log("✅ [fetchHotelById] ID:", req.params.id);

    const hotel = await getHotelById(req.params.id);
    if (!hotel) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }
    res.json(hotel);
    return;
  } catch (err) {
    console.error("❌ [fetchHotelById] Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

// -------------------------
// GET /api/hotels/:id/reviews
export const fetchHotelReviews: RequestHandler = async (req, res) => {
  try {
    console.log("✅ [fetchHotelReviews] ID:", req.params.id);

    const hotelId = Number(req.params.id);
    if (isNaN(hotelId)) {
      res.status(400).json({ message: "Invalid hotel ID" });
      return;
    }

    const hotelReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.hotelId, hotelId));

    console.log("✅ [fetchHotelReviews] Found reviews:", hotelReviews.length);
    res.json(hotelReviews);
    return;
  } catch (err) {
    console.error("❌ [fetchHotelReviews] Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

// -------------------------
// POST /api/hotels/:id/reviews
export const createHotelReview: RequestHandler = async (req, res) => {
  try {
    console.log("✅ [createHotelReview] Body:", req.body);

    const hotelId = Number(req.params.id);
    if (isNaN(hotelId)) {
      res.status(400).json({ message: "Invalid hotel ID" });
      return;
    }

    const { name, comment, stars } = req.body;
    if (!name || !comment || stars == null) {
      res.status(400).json({ message: "Name, comment, and stars are required" });
      return;
    }

    const newReview = await db.insert(reviews).values({
      hotelId,
      name,
      comment,
      stars,
    });

    console.log("✅ [createHotelReview] Inserted:", newReview);
    res.status(201).json({
      message: "Review created successfully",
      review: newReview,
    });
    return;
  } catch (err) {
    console.error("❌ [createHotelReview] Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

// -------------------------
// POST /api/hotels ✅
export const registerHotel: RequestHandler = async (req: MulterRequest, res) => {
  try {
    console.log("✅ [registerHotel] Body:", req.body);
    console.log("✅ [registerHotel] File:", req.file);

    const parse = CreateHotelValidator.safeParse(req.body);
    console.log("✅ [registerHotel] Parse result:", parse);

    if (!parse.success) {
      console.log("❌ [registerHotel] Validation failed:", parse.error.flatten().fieldErrors);
      res.status(400).json({ errors: parse.error.flatten().fieldErrors });
      return;
    }

    let imageUrl: string | undefined = undefined;
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    }

    const hotel = await createHotel({
      ...parse.data,
      imageUrl,
      rating: parse.data.rating ?? undefined,
    });

    console.log("✅ [registerHotel] Hotel created:", hotel);
    res.status(201).json({
      message: "Hotel created successfully",
      hotel,
    });
    return;
  } catch (err) {
    console.error("❌ [registerHotel] Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

// -------------------------
// PUT /api/hotels/:id ✅
export const modifyHotel: RequestHandler = async (req: MulterRequest, res) => {
  try {
    console.log("✅ [modifyHotel] Body:", req.body);
    console.log("✅ [modifyHotel] File:", req.file);

    const parse = CreateHotelValidator.safeParse(req.body);
    console.log("✅ [modifyHotel] Parse result:", parse);

    if (!parse.success) {
      console.log("❌ [modifyHotel] Validation failed:", parse.error.flatten().fieldErrors);
      res.status(400).json({ errors: parse.error.flatten().fieldErrors });
      return;
    }

    const updateData: typeof parse.data & { imageUrl?: string } = {
      ...parse.data,
      rating: parse.data.rating ?? undefined,
    };

    if (req.file && req.file.path) {
      updateData.imageUrl = req.file.path;
    }

    const hotel = await updateHotel(req.params.id, updateData);
    console.log("✅ [modifyHotel] Updated hotel:", hotel);

    if (!hotel) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }

    res.json(hotel);
    return;
  } catch (err) {
    console.error("❌ [modifyHotel] Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

// -------------------------
// DELETE /api/hotels/:id
export const removeHotel: RequestHandler = async (req, res) => {
  try {
    console.log("✅ [removeHotel] ID:", req.params.id);

    const deleted = await deleteHotel(req.params.id);
    console.log("✅ [removeHotel] Deleted:", deleted);

    if (!deleted) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }

    res.json({ message: "Hotel deleted successfully" });
    return;
  } catch (err) {
    console.error("❌ [removeHotel] Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};
