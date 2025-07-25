// src/profile/profile.route.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as profileController from "./profile.controller";

const router = Router();

router.put("/", authenticate, profileController.updateProfile);

export default router;
