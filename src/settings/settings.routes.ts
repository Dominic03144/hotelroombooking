import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as settingsController from "../settings/settings.controller";

const router = express.Router();

router.put("/email", authenticate, settingsController.updateEmail);
router.put("/password", authenticate, settingsController.changePassword);

export default router;
