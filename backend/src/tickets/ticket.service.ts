// src/services/ticket.service.ts
import  db  from "../drizzle/db";
import { tickets } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { CreateTicketInput } from "../tickets/ticket.validator";

export const createTicket = async (data: CreateTicketInput) => {
  const [newTicket] = await db.insert(tickets).values(data).returning();
  return newTicket;
};

export const getAllTickets = async () => {
  return await db.select().from(tickets).orderBy(tickets.createdAt);
};

export const getTicketById = async (ticketId: number) => {
  const [ticket] = await db.select().from(tickets).where(eq(tickets.ticketId, ticketId));
  return ticket;
};

export const deleteTicketById = async (ticketId: number) => {
  return await db.delete(tickets).where(eq(tickets.ticketId, ticketId)).returning();
};

export const resolveTicket = async (ticketId: number) => {
  return await db.update(tickets)
    .set({ status: "Resolved" })
    .where(eq(tickets.ticketId, ticketId))
    .returning();
};
