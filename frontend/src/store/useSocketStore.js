// src/store/useSocketStore.js
import { create } from "zustand";
import { io } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import {useNotificationStore} from "../store/useNotificationStore";

export const useSocketStore = create((set, get) => ({
  socket: null,

  // Initialize socket connection
  connect: () => {
    //Zustand will persist state between hot reloads, so this can prevent duplicates
    const existingSocket = get().socket;
    if (existingSocket && existingSocket.connected) return;

    console.log("🔌 Socket connecting...");
    const accessToken = useAuthStore.getState().accessToken;
    console.log("🔑 Access token:", accessToken);
    if (!accessToken) return;

    const socket = io("http://localhost:5000", {
      autoConnect: false,
      auth: {
        token: accessToken,
      },
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    socket.connect();
    // Optional: log connection
    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
    });

    //get all the notifications related to user
    socket.on("initialNotifications", (notifArray) => {
      console.log("📥 Received all notifications:", notifArray);
    
      //  Set them directly into the store
      useNotificationStore.getState().setNotifications(notifArray);
    
      console.log("📥 Notifications now in store:", useNotificationStore.getState().notification);
    });

    socket.on("newNotification", (notifData) => {
      console.log("📥 Received real-time notification:", notifData);

      // push to store state
      useNotificationStore.getState().addNotification(notifData);
      
      console.log("📥 Received real-time notifications from state:", useNotificationStore.getState().notification);
    });

    socket.on("connect_error", async (err) => {
      console.error("🚨 Socket connect error:", err.message);

      if (err.message.includes("Invalid or expired token")) {
        try {
          // Try refreshing the token manually (from your auth store)
          const newToken = await useAuthStore.getState().refreshAccessToken();
          useSocketStore.get().reconnectWithNewToken(newToken);
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError.message);
          // Optional: Logout user or show login modal
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    set({ socket });
  },

  // Disconnect socket manually
  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  // Update token and reconnect
  reconnectWithNewToken: (newToken) => {
    console.log("🔑 Reconnecting with new token:", newToken);
    const oldSocket = get().socket;
    if (!oldSocket) return;

    oldSocket.auth.token = newToken;
    oldSocket.disconnect(); // Triggers reconnection
    oldSocket.connect();
  },
}));
