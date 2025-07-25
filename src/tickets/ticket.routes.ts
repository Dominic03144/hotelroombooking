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

const router = Router();

// ---------------------------------------------
// TICKET ROUTES
// ---------------------------------------------

// ✅ Create a new ticket — any authenticated user
router.post(
  "/",
  authenticate,
  authorizeRoles("user", "member", "driver", "admin", "owner"),
  createTicketHandler
);

// ✅ Get ALL tickets — admin or owner only
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "owner"),
  getAllTicketsHandler
);

// ✅ Get MY tickets — authenticated user only
router.get(
  "/my",
  authenticate,
  authorizeRoles("user", "member", "driver", "admin", "owner"),
  getMyTicketsHandler
);

// ✅ Get a single ticket by ID — any authenticated user
router.get(
  "/:ticketId",
  authenticate,
  authorizeRoles("user", "member", "driver", "admin", "owner"),
  getTicketByIdHandler
);

// ✅ Delete ticket by ID — admin only
router.delete(
  "/:ticketId",
  authenticate,
  authorizeRoles("admin"),
  deleteTicketByIdHandler
);

// ✅ Update ticket status (resolve) — admin only
router.patch(
  "/:ticketId",
  authenticate,
  authorizeRoles("admin"),
  resolveTicketHandler
);

export default router;
