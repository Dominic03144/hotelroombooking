import { RequestHandler } from "express";
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from "./rooms.service";
import { CreateRoomValidator, UpdateRoomValidator } from "./rooms.validator";

export const fetchAllRooms: RequestHandler = async (_req, res) => {
  const rooms = await getAllRooms();
  res.json(rooms);
  return;
};

export const fetchRoomById: RequestHandler = async (req, res) => {
  const room = await getRoomById(Number(req.params.id));
  if (!room) {
    res.status(404).json({ message: "Room not found" });
    return;
  }
  res.json(room);
  return;
};

export const registerRoom: RequestHandler = async (req, res) => {
  const parsed = CreateRoomValidator.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const room = await createRoom({
    ...parsed.data,
    pricePerNight: String(parsed.data.pricePerNight),
  });
  res.status(201).json({ message: "Room created successfully", room });
  return;
};

export const modifyRoom: RequestHandler = async (req, res) => {
  const parsed = UpdateRoomValidator.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const room = await updateRoom(Number(req.params.id), {
    ...parsed.data,
    pricePerNight:
      parsed.data.pricePerNight !== undefined ? String(parsed.data.pricePerNight) : undefined,
  });
  if (!room) {
    res.status(404).json({ message: "Room not found" });
    return;
  }
  res.json(room);
  return;
};

export const removeRoom: RequestHandler = async (req, res) => {
  const deleted = await deleteRoom(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ message: "Room not found" });
    return;
  }
  res.json({ message: "Room deleted successfully" });
  return;
};
