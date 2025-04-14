import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

import axiosInstance from "../utils/axiosInstance";
import { useSocketStore } from "./useSocketStore";
import { rawAxios } from "../utils/axiosInstance";
import { handleApiError } from "../utils/errorHandler";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      authUser: null,
      isCheckingAuth: true,
      accessToken: null,
      isLoggingIn: false,
      TooManyAttempts: false,
      sendingEmail: false,
      isResetingPassword: false,
      isRegistering: false,

      hasCheckedAuth: false, // NEW: track if checkAuth ran

      // Setters
      setTooManyAttempts: (value) => {
        set({ TooManyAttempts: value });
      },
      setAccessToken: (token) => {
        set({ accessToken: token });
      },
      setAuthUser: (user) => {
        set({ authUser: user });
      },

      register: async (data, navigate) => {
        set({ isRegistering: true });
        try {
          const response = await rawAxios.post("/auth/register", data);
          toast.success(response?.data?.message || "Registration successful!");
          if (response) {
            navigate("/signin");
          }
          return true;
        } catch (error) {
          handleApiError(error);
        } finally {
          set({ isRegistering: false });
        }
      },

      //  functions
      checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
          //  Get the expired token from store
          const expiredToken = get().accessToken;

          //  Send it in Authorization header
          const res = await rawAxios.post("/auth/refresh-token", null, {
            headers: {
              Authorization: `Bearer ${expiredToken}`,
            },
            withCredentials: true,
          });

          get().setAccessToken(res.data.accessToken);
          get().setAuthUser(res.data.user);

          return true;
        } catch (error) {
          console.error(
            " Token refresh failed",
            error.response?.data || error.message,
          );
          get().logout();
          return false;
        } finally {
          set({ isCheckingAuth: false, hasCheckedAuth: true }); // ✅ important
        }
      },
      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const response = await rawAxios.post("/auth/login", data);

          get().setAccessToken(response.data.accessToken); // Set token in state
          get().setAuthUser(response.data.user); // Set user in state
          useSocketStore.getState().connect();

          console.log(`response:`, response);
          toast.success(response?.data?.message); // Show success message
          
          return true; // Let component know it succeeded
        } catch (error) {
          handleApiError(error); // Show error
          return false;
        } finally {
          set({ isLoggingIn: false });
        }
      },
      logout: async () => {
        try {
          console.log("Logout called");
          // Make sure to send credentials for cookies
          const response = await rawAxios.post("/auth/logout", {});
          console.log("Logout response:", response);

          // Clear Zustand state
          set({ accessToken: null, authUser: null });

          // Disconnect socket
          useSocketStore.getState().disconnect();

          // toast.success(response?.data?.message || "Logged out successfully!");
          return true;
        } catch (error) {
          console.error("Logout Error:", error);
          handleApiError(error);
          return false;
        }
      },

      forgotPassword: async (data) => {
        set({ sendingEmail: true });
        try {
          const response = await axiosInstance.post(
            "/auth/forgot-password",
            data,
          );
          // if (response.data.message) {
          //   toast.success(response.data.message);
          // }
          toast.success(response?.data?.message);
          return response.data; //  Ensure store returns response to component
        } catch (error) {
          console.error("API Error:", error.response?.data || error.message); //  Log error details
          handleApiError(error); //  Show error toast
        } finally {
          set({ sendingEmail: false });
        }
      },
      resetPassword: async (newPassword, token) => {
        //  Accept both newPassword & token
        set({ isResettingPassword: true });

        try {
          const response = await axiosInstance.patch(
            `/auth/reset-password?token=${token}`, // Send token as query param
            { newPassword }, // Send new password in request body
          );

          toast.success(response?.data?.message);
          return response.data; //  Ensure store returns response to component
        } catch (error) {
          console.error("API Error:", error.response?.data || error.message); //  Log error details
          handleApiError(error); //  Show error toast
        } finally {
          set({ isResettingPassword: false });
        }
      },
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        authUser: state.authUser,
        accessToken: state.accessToken,
      }),
    },
  ),
);
