import { Request, Response } from "express";
import {
  createTicket,
  getAllTickets,
  getTicketById,
  deleteTicketById,
  resolveTicket,
} from "../tickets/ticket.service";
import { CreateTicketValidator } from "../tickets/ticket.validator";

export const createTicketHandler = async (req: Request, res: Response) => {
  const parsed = CreateTicketValidator.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const ticket = await createTicket(parsed.data);
  res.status(201).json(ticket);
  return;
};

export const getAllTicketsHandler = async (_req: Request, res: Response) => {
  const allTickets = await getAllTickets();
  res.json(allTickets);
  return;
};

export const getTicketByIdHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.ticketId);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const ticket = await getTicketById(id);
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  res.json(ticket);
  return;
};

export const deleteTicketByIdHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.ticketId);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const deleted = await deleteTicketById(id);
  res.json(deleted);
  return;
};

export const resolveTicketHandler = async (req: Request, res: Response) => {
  const id = Number(req.params.ticketId);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const resolved = await resolveTicket(id);
  res.json(resolved);
  return;
};
