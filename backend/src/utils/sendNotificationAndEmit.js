import Notification from "../models/Notification.model.js";
import { activeUsers } from "../socket/index.js"; // adjust path as needed
import { io } from "../server.js";

export const sendNotificationAndEmit = async ({
  userId,
  message,
  type,
  companyId,
  projectId,
  createdBy,
}) => {
  // 1. Create and save the notification
  const notification = new Notification({
    userId,
    message,
    type,
    companyId,
    projectId : projectId || null,
    read: false,
    createdBy,
  });

  await notification.save();

  // 2. Emit real-time notification (if user is connected)
  const socketId = activeUsers[userId.toString()];
  if (socketId) {
    io.to(socketId).emit("newNotification", {
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,
      read: notification.read,
    });
    console.log(`📢 Sent real-time notification to user: ${userId}`);
  } else {
    console.log(`🕳️ User ${userId} not connected via socket`);
  }
};
