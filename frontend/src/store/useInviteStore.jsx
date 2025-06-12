import { create } from "zustand";

import axiosInstance from "../utils/axiosInstance";
import { handleApiError } from "../utils/errorHandler";
import { toast } from "sonner";

export const useInviteStore = create((set, get) => ({
  isSendingInvite: false,
  isJoining: false,
  isFetchingInvites: false,
  InviteUser: async (data) => {
    set({ isSendingInvite: true });
    try {
      const response = await axiosInstance.post("/invites/", data);
      console.log("response from invite:", response);
      if (response) {
        return true;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
      return null;
    } finally {
      set({ isSendingInvite: false });
    }
  },
  joinCompany: async (token) => {
    set({ isJoining: true });
    console.log("is Joining company");
    try {
      const response = await axiosInstance.post(`/invites/${token}/join`, {});
      console.log("response from invite:", response);
      if (response) {
        return true;
      }
    } catch (error) {
      toast.error(error?.response?.data || "An error occured!");
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
      return null;
    } finally {
      set({ isJoining: false });
    }
  },
  fetchInvites : async () => {
    set({ isFetchingInvites: true });
    try {
      const response = await axiosInstance.get("/invites/");
      console.log("response from invite:", response);
      if (response) {
        return response.data.invites;
      }
    } catch (error) {
      toast.error(error?.response?.data || "An error occured!");
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
      return null;
    } finally {
      set({ isFetchingInvites: false });
    }
  },
  deleteInvite: async (inviteId) => {
    try {
      const response = await axiosInstance.delete(`/invites/${inviteId}`);
      console.log("response from invite:", response);
      if (response) {
        return true;
      }
    } catch (error) {
      toast.error(error?.response?.data || "An error occured!");
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
      return null;
    }
  },
}));
