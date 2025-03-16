import axios from "axios";
import { getAccessTokenFromState } from "./authHelpers";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "/api", // Uses env variable if available
});

//  Interceptor to attach Authorization header dynamically
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getAccessTokenFromState();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//Interceptor to handle expired tokens and refresh them
axiosInstance.interceptors.request.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If access token is expired (401 Unauthorized), try refreshing it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Request a new access token using refresh token (sent via cookies)
        const res = await axiosInstance.post("/refresh-token");

        const newAccessToken = res.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken); //Save new token in Zustand

        // Retry the failed request with the new token
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token expired. Logging out...");

        try {
          await axios.post("/api/auth/logout",{}, { withCredentials: true }); // Call backend logout endpoint
        } catch (logoutError) {
          console.error("Error logging out:", logoutError);
        }

        useAuthStore.getState().setAccessToken(null); // Remove token from Zustand
        window.location.href = "/login"; //  Redirect to login page
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
