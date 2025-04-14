// routes/inviteRoutes.js

import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import {
  sendInvite,
  getSentInvites,
  revokeInvite,
  validateInviteToken,
  joinCompany,
} from "../controllers/invite.controller.js";

const router = express.Router();

// 🔐 Admin-only routes
router.post( "/", authMiddleware, roleMiddleware("admin"), sendInvite );
router.get("/",authMiddleware,roleMiddleware("admin"), getSentInvites );
router.delete("/:inviteId",authMiddleware,roleMiddleware("admin"), revokeInvite );

// 🌍 Public route – no auth needed
router.get("/:token", validateInviteToken );

// ⚡ Join company using token
router.post("/:token/join",authMiddleware, joinCompany );

export default router;
