import { Router } from "express";
import {
  createTicketHandler,
  deleteTicketByIdHandler,
  getAllTicketsHandler,
  getMyTicketsHandler,
  getTicketByIdHandler,
  resolveTicketHandler,
} from "../tickets/ticket.controller";
import {
  authenticate,
  authorizeRoles,
} from "../middleware/auth.middleware";

const ticketsRouter = Router();

// ---------------------------------------------
// TICKET ROUTES
// ---------------------------------------------

// ✅ Create a new ticket — any authenticated user
ticketsRouter.post(
  "/",
  authenticate,
  authorizeRoles("user", "member", "driver", "admin", "owner"),
  createTicketHandler
);

// ✅ Get ALL tickets — admin or owner only
ticketsRouter.get(
  "/",
  authenticate,
  authorizeRoles("admin", "owner"),
  getAllTicketsHandler
);

// ✅ Get MY tickets — authenticated user only
ticketsRouter.get(
  "/my",
  authenticate,
  authorizeRoles("user", "member", "driver", "admin", "owner"),
  getMyTicketsHandler
);

// ✅ Get a single ticket by ID — any authenticated user
ticketsRouter.get(
  "/:ticketId",
  authenticate,
  authorizeRoles("user", "member", "driver", "admin", "owner"),
  getTicketByIdHandler
);

// ✅ Delete ticket by ID — admin only
ticketsRouter.delete(
  "/:ticketId",
  authenticate,
  authorizeRoles("admin"),
  deleteTicketByIdHandler
);

// ✅ Update ticket status (resolve) — admin only
ticketsRouter.patch(
  "/:ticketId",
  authenticate,
  authorizeRoles("admin"),
  resolveTicketHandler
);

export default ticketsRouter;
