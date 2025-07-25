import db from "../drizzle/db";
import { reviews, hotels } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function fetchAllReviews() {
  // Fetch all reviews joining hotel name for convenience
  return await db
    .select({
      reviewId: reviews.reviewId,
      hotelId: reviews.hotelId,
      hotelName: hotels.hotelName,
      name: reviews.name,
      comment: reviews.comment,
      stars: reviews.stars,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .leftJoin(hotels, eq(reviews.hotelId, hotels.hotelId));
}
