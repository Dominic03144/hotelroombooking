import { Request, Response } from "express";
import * as reviewService from "./reviews.service";

export async function getAllReviews(req: Request, res: Response) {
  try {
    const reviews = await reviewService.fetchAllReviews();
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Failed to get reviews", error });
  }
}
