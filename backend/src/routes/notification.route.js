import express from "express";
import { createNotification, getNotifications, markNotificationAsRead, deleteNotification, createSystemAnnouncement, markAllAsRead, getProjectNotificationsByProject, getSystemAnnouncements } from "../controllers/notification.controller.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = express.Router();


router.post("/", authMiddleware, createNotification); // Route to create a notification (Triggered by task assignment, project creation, etc.)
router.post("/announcement", authMiddleware, roleMiddleware("admin"), createSystemAnnouncement); // Only allow admin to make announcements
router.get("/announcement", authMiddleware, getSystemAnnouncements); // fetch all system announcements
router.get("/", authMiddleware, getNotifications); // Route to get all notifications for the logged-in user
router.get("/project/:projectId", authMiddleware, getProjectNotificationsByProject);
router.patch("/:id/read", authMiddleware, markNotificationAsRead); // Route to mark a notification as read
router.patch("/mark-all-read", authMiddleware, markAllAsRead);
router.delete("/:id", authMiddleware, deleteNotification); // Route to delete a notification
 
export default router;
