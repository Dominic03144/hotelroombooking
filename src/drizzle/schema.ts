import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  doublePrecision,
  numeric,
  boolean,
  date,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ======================== ENUMS ========================

export const bookingStatusEnum = pgEnum("booking_status", [
  "Pending",
  "Confirmed",
  "Cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "Pending",
  "Completed",
  "Failed",
]);

export const ticketStatusEnum = pgEnum("ticket_status", ["Open", "Resolved"]);

// ======================== TABLES ========================

// ---------- USERS ----------
export const users = pgTable(
  "users",
  {
    userId: serial("user_id").primaryKey(),
    firstname: varchar("firstname", { length: 100 }).notNull(),
    lastname: varchar("lastname", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: text("password").notNull(),
    contactPhone: varchar("contact_phone", { length: 20 }),
    address: text("address"),
    profileImageUrl: text("profile_image_url"),
    role: text("role").default("user").notNull(),
    isVerified: boolean("is_verified").default(false),

    verificationCode: varchar("verification_code", { length: 6 }),
    verificationCodeExpiresAt: timestamp("verification_code_expires_at", {
      withTimezone: true,
    }),

    resetPasswordCode: varchar("reset_password_code", { length: 6 }),
    resetPasswordExpiresAt: timestamp("reset_password_expires_at", {
      withTimezone: true,
    }),

    isTokenExpired: boolean("is_token_expired").default(false),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    roleCheck: {
      check: `role IN ('user', 'admin', 'member', 'owner', 'driver', 'customer')`,
    },
  })
);

// ---------- HOTELS ----------
export const hotels = pgTable("hotels", {
  hotelId: serial("hotel_id").primaryKey(),
  hotelName: varchar("hotel_name", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  address: text("address").notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }),
  category: varchar("category", { length: 50 }),
  rating: doublePrecision("rating").default(0.0),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ---------- ROOMS ----------
export const rooms = pgTable("rooms", {
  roomId: serial("room_id").primaryKey(),
  hotelId: integer("hotel_id")
    .notNull()
    .references(() => hotels.hotelId, { onDelete: "cascade" }),
  roomType: varchar("room_type", { length: 50 }).notNull(),
  pricePerNight: numeric("price_per_night", { precision: 10, scale: 2 }).notNull(),
  capacity: integer("capacity").notNull(),
  amenities: text("amenities"),
  isAvailable: boolean("is_available").default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ---------- BOOKINGS ----------
export const bookings = pgTable("bookings", {
  bookingId: serial("booking_id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  roomId: integer("room_id")
    .notNull()
    .references(() => rooms.roomId, { onDelete: "cascade" }),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  bookingStatus: bookingStatusEnum("booking_status").default("Pending").notNull(),
  guests: integer("guests").notNull().default(1),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ---------- PAYMENTS ----------
export const payments = pgTable("payments", {
  paymentId: serial("payment_id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.bookingId, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("Pending").notNull(),
  paymentDate: timestamp("payment_date", { withTimezone: true }).defaultNow(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 100 }),
  receiptUrl: text("receipt_url"), // ✅ <-- NEW FIELD!
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ---------- TICKETS ----------
export const tickets = pgTable("tickets", {
  ticketId: serial("ticket_id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 200 }).notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").default("Open").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ---------- REVIEWS ----------
export const reviews = pgTable("reviews", {
  reviewId: serial("review_id").primaryKey(),
  hotelId: integer("hotel_id")
    .notNull()
    .references(() => hotels.hotelId, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  comment: text("comment").notNull(),
  stars: integer("stars").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ======================== RELATIONS ========================

export const userRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  tickets: many(tickets),
}));

export const hotelRelations = relations(hotels, ({ many }) => ({
  rooms: many(rooms),
  reviews: many(reviews),
}));

export const roomRelations = relations(rooms, ({ one, many }) => ({
  hotel: one(hotels, {
    fields: [rooms.hotelId],
    references: [hotels.hotelId],
  }),
  bookings: many(bookings),
}));

export const bookingRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.userId],
  }),
  room: one(rooms, {
    fields: [bookings.roomId],
    references: [rooms.roomId],
  }),
  payments: many(payments),
}));

export const paymentRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.bookingId],
  }),
}));

export const ticketRelations = relations(tickets, ({ one }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.userId],
  }),
}));
