import { z } from "zod";

export const CreateRoomValidator = z.object({
  hotelId: z.number().int().positive(),
  roomType: z.string().min(1),
  pricePerNight: z.number().positive(),
  capacity: z.number().int().positive(),
  amenities: z.string().optional(),
  isAvailable: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
});

export const UpdateRoomValidator = CreateRoomValidator.partial();

export type CreateRoomInput = z.infer<typeof CreateRoomValidator>;
export type UpdateRoomInput = z.infer<typeof UpdateRoomValidator>;
