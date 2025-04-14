import { create } from "zustand";
import { toast } from "sonner";

import { useAuthStore } from "../store/useAuthStore";
import axiosInstance from "../utils/axiosInstance";
import { handleApiError } from "../utils/errorHandler";

export const useCompanyStore = create((set, get) => ({
  isRegisteringCompany: false,
  isFetchingCompany: false,
  showSearch: false,
  company: null,
  setShowSearch: (value) => set({ showSearch: value }),
  registerCompany: async (data) => {
    set({ isRegesteringCompany: true });
    try {
      const response = await axiosInstance.post("/companies/", data);

      useAuthStore.getState().setAccessToken(response.data.accessToken); // Set token in state
      useAuthStore.getState().setAuthUser(response.data.user); // Set user in state

      toast.success(response?.data?.message || "Registration successful!");
      return true;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    } finally {
      set({ isRegisteringCompany: false });
    }
  },
  searchCompany: async (token) => {
    set({ isFetchingCompany: true });
    try {
      const response = await axiosInstance.get(`/invites/${token}`);
      set({company: response.data.invite.company});
      return response.data.invite.company;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
      return null;
    } finally {
      set({ isFetchingCompany: false });
    }
  },
}));
