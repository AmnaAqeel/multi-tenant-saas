import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import axiosInstance from "../utils/axiosInstance";
import { handleApiError } from "../utils/errorHandler";
import { toast } from "sonner";
import log from "../utils/logger";

export const useNotificationStore = create((set, get) => ({
  notification: [],
  UnreadNotifications: [],
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

  setUnreadNotifications: () => {
    const { notification } = get(); // get latest state
    const unread = notification.filter((n) => !n.read);
    set({ UnreadNotifications: unread });
  },

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
      const response = await axiosInstance.patch(
        `/notifications/${id}/read`,
        {},
      );
      log("markasRead response:", response);

      if (response) {
        toast.success("Marked as read");
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
      const response = await axiosInstance.patch(
        `/notifications//mark-all-read`,
        {},
      );
      log("markAllRead response:", response);

      if (response) {
        toast.success("All marked as read");
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
      log("Notfication delete response:", response);

      if (response) {
        toast.success("Notification removed succesfully!");
      }

      return true;
    } catch (error) {
      console.error("Notfication delete:", error);
      handleApiError(error);
      return false;
    }
  },
  fetchNotifications: async (projectId) => {
    if (!projectId) return []; // Defensive check for undefined
    try {
      const response = await axiosInstance.get(
        `/notifications/project/${projectId}`,
      );
      log("RESPONSE FROM USE_NOTIFICATION_STORE:", response);
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      handleApiError(error);
      return [];
    }finally{
      set({ loading: false });
    }
  },
  createAnnouncementApi : async (message) => {
    try {
      const response = await axiosInstance.post(`/notifications/announcement`, { message });
      log("response:", response);
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      handleApiError(error);
      return false;
    }   
  },
  fetchSystemAnnouncements : async () => {
    try {
      const response = await axiosInstance.get(`/notifications/announcement`);
      log("System Notifications:", response);
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      handleApiError(error);
      return [];
    }
  },
}));
