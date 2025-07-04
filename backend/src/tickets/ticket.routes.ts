import { Router } from "express";
import {
  createTicketHandler,
  getAllTicketsHandler,
  getTicketByIdHandler,
  deleteTicketByIdHandler,
  resolveTicketHandler,
} from "../tickets/ticket.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

// Create ticket - any authenticated user
router.post("/", authenticate, authorizeRoles("user", "member", "admin", "owner", "driver"), createTicketHandler);

// Get all tickets - any authenticated user
router.get("/", authenticate, authorizeRoles("user", "member", "admin", "owner", "driver"), getAllTicketsHandler);

// Get ticket by ID - any authenticated user
router.get("/:ticketId", authenticate, authorizeRoles("user", "member", "admin", "owner", "driver"), getTicketByIdHandler);

// Delete ticket - admins only
router.delete("/:ticketId", authenticate, authorizeRoles("admin"), deleteTicketByIdHandler);

// Resolve ticket - admins only
router.patch("/:ticketId/resolve", authenticate, authorizeRoles("admin"), resolveTicketHandler);

export default router;
