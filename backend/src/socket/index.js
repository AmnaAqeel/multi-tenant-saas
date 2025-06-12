import { verifySocketToken } from "./authMiddleware.js"; // Import the middleware
import Notification from "../models/Notification.model.js";

export const activeUsers = {};

export const setupSocket = (io) => {
  // Apply the verification middleware to every new socket connection
  io.use(verifySocketToken);

  io.on("connection", async (socket) => {
    console.log("⚡ New client connected:", socket.id);
    const companyId = socket.user?.companyId?._id || socket.user?.companyId;

    const userId = socket.user.id; // Assuming the token contains userId
    activeUsers[userId] = socket.id; // Map the userId to their socketId

    if (!companyId) {
      console.error('No companyId found for socket connection.');
      socket.disconnect();
      return;
   }   

    const unread = await Notification.find({
      companyId,
      userId,
      type: { $ne: "system_announcement" }
    })
    .populate("createdBy", "profilePicture") // populate fields from user
    .sort({ createdAt: -1 });  
    socket.emit("initialNotifications", unread); // always emit, even if empty

    // Now you can access user data on the socket (stored in socket.user)
    console.log("Connected user:", socket.user); // e.g., { userId: ..., companyId: ... }

    socket.on("disconnect", () => {
      console.log("👋 Client disconnected:", socket.id);
      delete activeUsers[userId]; // Remove user from the activeUsers map on disconnect
    });

    // You can now use socket.user for custom events, like sending notifications to a specific user.
  });
};
