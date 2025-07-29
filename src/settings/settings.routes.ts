import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as settingsController from "../settings/settings.controller";

const settingsRouter = express.Router();

settingsRouter.put("/email", authenticate, settingsController.updateEmail);
settingsRouter.put("/password", authenticate, settingsController.changePassword);

export default settingsRouter;
