import { create } from "zustand";
import { toast } from "sonner";

import axiosInstance from "../utils/axiosInstance";
import { handleApiError } from "../utils/errorHandler";


export const useAuthStore = create((set, get) => ({
  accessToken: null,
  isLoggingIn: false,
  TooManyAttempts: false,
  sendingEmail: false,
  isResetingPassword: false,
  setTooManyAttempts: (value) => {
    set({ TooManyAttempts: value });
  },
  setAccessToken: (token) => {
    set({ accessToken: token });
  },
  isRegistering: false,
  register: async (data) => {
    set({ isRegistering: true });
    try {
      const response = await axiosInstance.post("/auth/register", data);
      toast.success(response.data.message);
    } catch (error) {
        console.error("API Error:", error.response?.data || error.message); //  Log error details
        handleApiError(error); //  Show error toast
    } finally {
      set({ isRegistering: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const response = await axiosInstance.post("/auth/login", data);
      get().setAccessToken(response.data.accessToken);
      // console.log("Store Response:", response.data); //  Debugging
  
      if (response.data.message) {
        toast.success(response.data.message);
      } 
      return response.data; //  Ensure store returns response to component
    } catch (error) {
        console.error("API Error:", error.response?.data || error.message); //  Log error details
        handleApiError(error); //  Show error toast
    } finally {
      set({ isLoggingIn: false });
    }
  },
  forgotPassword: async (data) => {
    set({ sendingEmail: true });
    try {
      const response = await axiosInstance.post("/auth/forgot-password", data);
      if (response.data.message) {
        toast.success(response.data.message);
      } 
      return response.data; //  Ensure store returns response to component
    } catch (error) {
        console.error("API Error:", error.response?.data || error.message); //  Log error details
        handleApiError(error); //  Show error toast
    } finally {
      set({ sendingEmail: false });
    }
  },
  resetPassword: async (newPassword, token) => {  //  Accept both newPassword & token
    set({ isResettingPassword: true });
  
    try {
      const response = await axiosInstance.patch(
        `/auth/reset-password?token=${token}`, // ✅ Send token as query param
        { newPassword } // ✅ Send new password in request body
      );
  
      if (response.data.message) {
        toast.success(response.data.message);
      } 
      return response.data; //  Ensure store returns response to component
    }
      catch (error) {
      console.error("API Error:", error.response?.data || error.message); //  Log error details
      handleApiError(error); //  Show error toast
    } finally {
      set({ isResettingPassword: false });
    }
  },  
}));
