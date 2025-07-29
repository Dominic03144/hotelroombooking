import { Router } from "express";
import {
  fetchAllHotels,
  fetchHotelById,
  fetchHotelReviews,
  createHotelReview,
  registerHotel,
  modifyHotel,
  removeHotel,
} from "./hotel.controller";

import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// ✅ Cloudinary config — make sure your .env is set up!
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ✅ Setup multer-storage-cloudinary with correct params shape
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, _file) => ({
    folder: "hotel_images",               // your Cloudinary folder
    format: "jpg",                        // force jpg or png if you like
    transformation: [
      { width: 1200, height: 800, crop: "limit" }, // optional resize
    ],
  }),
});

// ✅ Create multer instance
const upload = multer({ storage });

const  hotelRouter = Router();

/** ✅ PUBLIC ROUTES */

// GET /api/hotels — list all hotels
 hotelRouter.get("/", fetchAllHotels);

// GET /api/hotels/:id — single hotel details
 hotelRouter.get("/:id", fetchHotelById);

// GET /api/hotels/:id/reviews — hotel reviews
 hotelRouter.get("/:id/reviews", fetchHotelReviews);

// POST /api/hotels/:id/reviews — create review (auth required)
 hotelRouter.post("/:id/reviews", authenticate, createHotelReview);

/** ✅ ADMIN ROUTES */

// POST /api/hotels — create hotel + image upload to Cloudinary
 hotelRouter.post(
  "/",
  authenticate,
  authorizeRoles("admin", "owner"),
  upload.single("image"),   // field name in form-data should be `image`
  registerHotel
);

// PUT /api/hotels/:id — update hotel + image upload
 hotelRouter.put(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  modifyHotel
);

// DELETE /api/hotels/:id — delete hotel
 hotelRouter.delete("/:id", authenticate, authorizeRoles("admin"), removeHotel);

export default hotelRouter;
