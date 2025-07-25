// ✅ src/controllers/admin/adminUsers.controller.ts

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import { AdminCreateUserValidator } from "./Admin.Validators";

export const adminCreateUser = async (req: Request, res: Response) => {
  // ... same as before ...
};
