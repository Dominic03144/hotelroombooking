import express from "express";
import { getAllReviews } from "./reviews.controller";

const router = express.Router();

// Public endpoint to get all reviews
router.get("/", getAllReviews);

export default router;
