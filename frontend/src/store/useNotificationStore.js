import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import axiosInstance from "../utils/axiosInstance";
import { handleApiError } from "../utils/errorHandler";
import { toast } from "sonner";

export const useNotificationStore = create((set, get) => ({
  notification: [],
  filteredNotification: [],
  newNotification: false, //for navbar
  hasNewNotification: false, //for sidebar
  loading: true,
  setNewNotification: (value) => set({ newNotification: value }),
  setHasNewNotfication: (val) => set({ hasNewNotification: val }),
  setFilteredNotification: (value) => set({ filteredNotification: value }),

  setNotifications: (notificationsArray) =>
    set(() => ({
      notification: notificationsArray,
      filteredNotification: notificationsArray,
      loading: false,
    })),

  addNotification: (newNotif) =>
    set((state) => {
      const _id = newNotif._id || uuidv4(); // Use DB _id or fallback uuid

      const exists = state.notification.some((n) => n._id === _id);
      if (exists) return {};
      set({ newNotification: true });
      set({ hasNewNotification: true });
      return {
        notification: [newNotif, ...state.notification],
      };
    }),
  markAsRead: async (id) => {
    try {
      // Make sure to send credentials for cookies
      const response = await axiosInstance.patch(`/notifications/${id}/read`, {});
      console.log("markasRead response:", response);

      if(response){
        toast.success("Marked as read")
      }

      return true;
    } catch (error) {
      console.error("markasRead Error:", error);
      handleApiError(error);
      return false;
    }
  },
  markAllAsRead: async () => {
    try {
      // Make sure to send credentials for cookies
      const response = await axiosInstance.patch(`/notifications//mark-all-read`, {});
      console.log("markAllRead response:", response);

      if(response){
        toast.success("All marked as read")
      }

      return true;
    } catch (error) {
      console.error("markAllRead Error:", error);
      handleApiError(error);
      return false;
    }
  },
  deleteNotification: async (id) => {
    try {
      // Make sure to send credentials for cookies
      const response = await axiosInstance.delete(`/notifications/${id}`, {});
      console.log("Notfication delete response:", response);

      if(response){
        toast.success("Notification removed succesfully!")
      }

      return true;
    } catch (error) {
      console.error("Notfication delete:", error);
      handleApiError(error);
      return false;
    }
  },
}));
