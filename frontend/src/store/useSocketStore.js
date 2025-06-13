// src/store/useSocketStore.js
import { create } from "zustand";
import { io } from "socket.io-client";
import log from "../utils/logger";

import { useAuthStore } from "./useAuthStore";
import {useNotificationStore} from "../store/useNotificationStore";

export const useSocketStore = create((set, get) => ({
  socket: null,

  // Initialize socket connection
  connect: () => {
    //Zustand will persist state between hot reloads, so this can prevent duplicates
    const existingSocket = get().socket;
    if (existingSocket && existingSocket.connected) return;

    log("🔌 Socket connecting...");
    const accessToken = useAuthStore.getState().accessToken;
    log("🔑 Access token:", accessToken);
    if (!accessToken) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
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
      log("🔌 Socket connected:", socket.id);
    });

    //get all the notifications related to user
    socket.on("initialNotifications", (notifArray) => {
      log("📥 Received all notifications:", notifArray);
    
      //  Set them directly into the store
      useNotificationStore.getState().setNotifications(notifArray);
    
      log("📥 Notifications now in store:", useNotificationStore.getState().notification);
    });

    socket.on("newNotification", (notifData) => {
      log("📥 Received real-time notification:", notifData);

      // push to store state
      useNotificationStore.getState().addNotification(notifData);
      
      log("📥 Received real-time notifications from state:", useNotificationStore.getState().notification);
    });

    socket.on("connect_error", async (err) => {
      console.error("🚨 Socket connect error:", err.message);

      if (err.message.includes("Invalid or expired token")) {
        const newToken = await refreshToken(); // Ensure this gives a valid token

        if (newToken) {
          socket.auth.token = newToken;
          socket.connect(); // manually reconnect with fresh token
        } else {
          log("❌ No valid token, not reconnecting.");
          socket.disconnect(); // stop loop
        }
      }
    });

    socket.on("disconnect", () => {
      log("❌ Socket disconnected");
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
    log("🔑 Reconnecting with new token:", newToken);
    const oldSocket = get().socket;
    if (!oldSocket) return;

    oldSocket.auth.token = newToken;
    oldSocket.disconnect(); // Triggers reconnection
    oldSocket.connect();
  },
}));
