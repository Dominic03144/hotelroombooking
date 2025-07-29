import express from "express";
import { getAllReviews } from "./reviews.controller";

const reviewRouter = express.Router();

// Public endpoint to get all reviews
reviewRouter.get("/", getAllReviews);

export default reviewRouter;
