import { Request, Response } from "express";
import {
  createTicket,
  getAllTickets,
  getTicketById,
  getTicketsByUserId,
  deleteTicketById,
  resolveTicket,
} from "../tickets/ticket.service";
import { CreateTicketValidator } from "../tickets/ticket.validator";

// ✅ Create a new ticket
export const createTicketHandler = async (req: Request, res: Response) => {
  const parsed = CreateTicketValidator.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const ticket = await createTicket(parsed.data);
  res.status(201).json({ ticket });
};

// ✅ Get ALL tickets (admin)
export const getAllTicketsHandler = async (_req: Request, res: Response) => {
  const allTickets = await getAllTickets();
  res.json(allTickets); // ✅ Plain array for RTK Query
};

// ✅ Get MY tickets (logged-in user)
export const getMyTicketsHandler = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(400).json({ error: "User ID not found in request." });
    return;
  }

  const tickets = await getTicketsByUserId(userId);
  res.json({ tickets: tickets || [] }); // ✅ Wrapped for user dashboard
};

// ✅ Get ticket by ID
export const getTicketByIdHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.ticketId);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ticket ID." });
    return;
  }

  const ticket = await getTicketById(id);

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found." });
    return;
  }

  res.json({ ticket });
};

// ✅ Delete ticket by ID
export const deleteTicketByIdHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.ticketId);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ticket ID." });
    return;
  }

  const deleted = await deleteTicketById(id);
  res.json({ deleted });
};

// ✅ Resolve ticket (update status)
export const resolveTicketHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.ticketId);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ticket ID." });
    return;
  }

  const status = req.body.status;
  if (!status || !["Open", "Resolved"].includes(status)) {
    res.status(400).json({ error: "Invalid status value." });
    return;
  }

  const resolved = await resolveTicket(id, status as "Open" | "Resolved");
  res.json({ ticket: resolved });
};
