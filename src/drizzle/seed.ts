import db from "./db";
import {
  users,
  hotels,
  rooms,
  bookings,
  payments,
  tickets,
  reviews,
} from "./schema";
import { eq, sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // ✅ Clear all tables and reset serial IDs
  await db.execute(
    sql`TRUNCATE TABLE bookings, rooms, hotels, payments, tickets, reviews, users RESTART IDENTITY CASCADE`
  );

  // ---------- USERS ----------
  const [adminUser] = await db
    .insert(users)
    .values({
      firstname: "Admin",
      lastname: "User",
      email: "admin@example.com",
      password: "hashedpassword1",
      role: "admin",
      isVerified: true,
    })
    .returning();

  const [normalUser] = await db
    .insert(users)
    .values({
      firstname: "John",
      lastname: "Doe",
      email: "john@example.com",
      password: "hashedpassword2",
      role: "user",
      isVerified: true,
    })
    .returning();

  // ---------- HOTELS ----------
  const [hotel1, hotel2] = await db
    .insert(hotels)
    .values([
      {
        hotelName: "Grand Plaza Hotel",
        city: "Nairobi",
        location: "CBD",
        address: "123 Main Street",
        contactPhone: "+254700000000",
        category: "5-star",
        rating: 4.5,
        imageUrl: "https://picsum.photos/seed/grandplaza/400/200",
      },
      {
        hotelName: "Coastal Paradise Resort",
        city: "Mombasa",
        location: "Nyali Beach",
        address: "789 Ocean Drive",
        contactPhone: "+254722222222",
        category: "5-star",
        rating: 4.7,
        imageUrl: "https://picsum.photos/seed/coastalparadise/400/200",
      },
    ])
    .returning();

  // ---------- ROOMS ----------
  const [hotel1Room1] = await db
    .insert(rooms)
    .values({
      hotelId: hotel1.hotelId,
      roomType: "Deluxe",
      pricePerNight: "150.00",
      capacity: 2,
      amenities: "WiFi, TV, AC",
      isAvailable: true,
      imageUrl: "https://source.unsplash.com/random/400x200?hotel-room-1",
    })
    .returning();

  const [hotel1Room2] = await db
    .insert(rooms)
    .values({
      hotelId: hotel1.hotelId,
      roomType: "Suite",
      pricePerNight: "250.00",
      capacity: 4,
      amenities: "WiFi, TV, AC, Kitchen",
      isAvailable: true,
      imageUrl: "https://source.unsplash.com/random/400x200?hotel-suite",
    })
    .returning();

  const [hotel2Room1] = await db
    .insert(rooms)
    .values({
      hotelId: hotel2.hotelId,
      roomType: "Ocean View",
      pricePerNight: "300.00",
      capacity: 3,
      amenities: "WiFi, TV, AC, Balcony",
      isAvailable: true,
      imageUrl: "https://source.unsplash.com/random/400x200?ocean-view",
    })
    .returning();

  const [hotel2Room2] = await db
    .insert(rooms)
    .values({
      hotelId: hotel2.hotelId,
      roomType: "Family Villa",
      pricePerNight: "450.00",
      capacity: 6,
      amenities: "WiFi, TV, AC, Kitchen, Private Pool",
      isAvailable: true,
      imageUrl: "https://source.unsplash.com/random/400x200?family-villa",
    })
    .returning();

  // ---------- BOOKINGS ----------
  const [booking1] = await db
    .insert(bookings)
    .values({
      userId: normalUser.userId,
      roomId: hotel1Room1.roomId,
      checkInDate: new Date().toISOString().split("T")[0],
      checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      totalAmount: "450.00",
      bookingStatus: "Confirmed",
      guests: 2,
      specialRequests: "Late check-in",
    })
    .returning();

  const [booking2] = await db
    .insert(bookings)
    .values({
      userId: normalUser.userId,
      roomId: hotel2Room1.roomId,
      checkInDate: new Date().toISOString().split("T")[0],
      checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      totalAmount: "600.00",
      bookingStatus: "Pending",
      guests: 3,
    })
    .returning();

  // ---------- PAYMENTS (✅ with receiptUrl example) ----------
  await db.insert(payments).values([
    {
      bookingId: booking1.bookingId,
      amount: "450.00",
      paymentStatus: "Completed",
      paymentMethod: "Credit Card",
      transactionId: "TX123456789",
      receiptUrl: "https://pay.stripe.com/receipts/test_receipt_1", // ✅ Example receipt URL
    },
    {
      bookingId: booking2.bookingId,
      amount: "600.00",
      paymentStatus: "Pending",
      paymentMethod: "Mpesa",
      transactionId: "MPESA98765",
      receiptUrl: null, // ✅ No receipt yet for pending
    },
  ]);

  // ---------- TICKETS ----------
  await db.insert(tickets).values([
    {
      userId: normalUser.userId,
      subject: "Room cleanliness issue",
      description: "The room was not cleaned properly.",
      status: "Open",
    },
    {
      userId: normalUser.userId,
      subject: "WiFi not working",
      description: "The WiFi in my room is not working.",
      status: "Resolved",
    },
  ]);

  // ---------- REVIEWS ----------
  await db.insert(reviews).values([
    {
      hotelId: hotel1.hotelId,
      name: "Dominic Kosgei",
      comment: "Fantastic stay! Loved the food and the staff.",
      stars: 5,
    },
    {
      hotelId: hotel1.hotelId,
      name: "Jane Wanjiku",
      comment: "Rooms were spacious and very clean.",
      stars: 4,
    },
    {
      hotelId: hotel2.hotelId,
      name: "Bukayo Saka",
      comment: "Great beach access, enjoyed the ocean view!",
      stars: 5,
    },
    {
      hotelId: hotel2.hotelId,
      name: "Mercy Cherono",
      comment: "Family villa was amazing, kids loved the pool.",
      stars: 4,
    },
  ]);

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
