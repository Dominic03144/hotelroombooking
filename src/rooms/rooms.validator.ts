import { z } from "zod";

/**
 * ✅ Validator for creating a new room
 */
export const CreateRoomValidator = z.object({
  hotelId: z.number({
    required_error: "Hotel ID is required.",
    invalid_type_error: "Hotel ID must be a number.",
  }).int().positive(),

  roomType: z.string({
    required_error: "Room type is required.",
  }).min(1, "Room type cannot be empty."),

  pricePerNight: z.number({
    required_error: "Price per night is required.",
  }).positive("Price must be greater than 0."),

  capacity: z.number({
    required_error: "Capacity is required.",
  }).int().positive("Capacity must be greater than 0."),

  amenities: z.string().optional(),

  isAvailable: z.boolean().optional(),

  imageUrl: z.string().url("Image URL must be a valid URL.").optional(),
});

/**
 * ✅ Validator for updating a room — all fields optional
 */
export const UpdateRoomValidator = CreateRoomValidator.partial();

/**
 * ✅ Type inference for inputs
 */
export type CreateRoomInput = z.infer<typeof CreateRoomValidator>;
export type UpdateRoomInput = z.infer<typeof UpdateRoomValidator>;
