// src/profile/profile.route.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as profileController from "./profile.controller";

const profileRouter = Router();

profileRouter.put("/", authenticate, profileController.updateProfile);

export default profileRouter;
