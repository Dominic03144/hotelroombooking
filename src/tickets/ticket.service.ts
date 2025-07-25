import db from "../drizzle/db";
import { tickets, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { CreateTicketInput } from "../tickets/ticket.validator";

// -----------------------------------------
// CREATE a new ticket
// -----------------------------------------
export const createTicket = async (data: CreateTicketInput) => {
  const [newTicket] = await db.insert(tickets).values(data).returning();
  return newTicket;
};

// -----------------------------------------
// GET ALL tickets (with joined user info)
// -----------------------------------------
export const getAllTickets = async () => {
  const result = await db
    .select({
      ticketId: tickets.ticketId,
      subject: tickets.subject,
      description: tickets.description,
      status: tickets.status,
      createdAt: tickets.createdAt,
      user: {
        userId: users.userId,
        firstname: users.firstname,
        lastname: users.lastname,
        email: users.email,
      },
    })
    .from(tickets)
    .innerJoin(users, eq(users.userId, tickets.userId))
    .orderBy(tickets.createdAt);

  return result; // ✅ Array of tickets with user info
};

// -----------------------------------------
// GET a ticket by its ID (with joined user)
// -----------------------------------------
export const getTicketById = async (ticketId: number) => {
  const [ticket] = await db
    .select({
      ticketId: tickets.ticketId,
      subject: tickets.subject,
      description: tickets.description,
      status: tickets.status,
      createdAt: tickets.createdAt,
      user: {
        userId: users.userId,
        firstname: users.firstname,
        lastname: users.lastname,
        email: users.email,
      },
    })
    .from(tickets)
    .innerJoin(users, eq(users.userId, tickets.userId))
    .where(eq(tickets.ticketId, ticketId));

  return ticket || null; // ✅ Always return null if not found
};

// -----------------------------------------
// GET tickets for a specific user
// -----------------------------------------
export const getTicketsByUserId = async (userId: number) => {
  const result = await db
    .select({
      ticketId: tickets.ticketId,
      subject: tickets.subject,
      description: tickets.description,
      status: tickets.status,
      createdAt: tickets.createdAt,
    })
    .from(tickets)
    .where(eq(tickets.userId, userId))
    .orderBy(tickets.createdAt);

  return result || []; // ✅ Always return array
};

// -----------------------------------------
// DELETE a ticket by ID
// -----------------------------------------
export const deleteTicketById = async (ticketId: number) => {
  const [deletedTicket] = await db
    .delete(tickets)
    .where(eq(tickets.ticketId, ticketId))
    .returning();

  return deletedTicket || null; // ✅ Return the deleted ticket or null
};

// -----------------------------------------
// UPDATE ticket status (resolve)
// -----------------------------------------
export const resolveTicket = async (
  ticketId: number,
  status: "Open" | "Resolved"
) => {
  const [updatedTicket] = await db
    .update(tickets)
    .set({ status })
    .where(eq(tickets.ticketId, ticketId))
    .returning();

  return updatedTicket || null; // ✅ Return single updated ticket or null
};
