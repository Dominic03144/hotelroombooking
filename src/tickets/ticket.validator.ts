// src/validators/ticket.validator.ts
import { z } from "zod";

export const CreateTicketValidator = z.object({
  userId: z.number(),
  subject: z.string().min(3, "Subject must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
});

export type CreateTicketInput = z.infer<typeof CreateTicketValidator>;
