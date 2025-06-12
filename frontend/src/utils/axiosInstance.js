import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { useSocketStore } from "../store/useSocketStore";

import { waitForToken } from "./waitForToken";

// Normal instance (has interceptors)
const axiosInstance = axios.create({
  // baseURL: import.meta.env.VITE_BACKEND_URL, // Uses env variable if available
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Raw instance (no interceptors)
export const rawAxios = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Request Interceptor — adds access token
axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    console.log("🔑 Access token from state:", accessToken);

    // Token not yet available? Wait.
    if (!accessToken) {
      const waitedToken = await waitForToken();
      config.headers["Authorization"] = `Bearer ${waitedToken}`;
      console.log("⏳ Waited and added token:", waitedToken);
    } else {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
      console.log("🔑 Directly added token:", accessToken);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor — refreshes token if expired
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;
      console.log("🔁 401 received — trying refresh...");

      try {
        console.log(
          "⏬ Trying to refresh token...",
          useAuthStore.getState().accessToken,
        );
        // ⏬ Get the expired token from store
        const expiredToken = useAuthStore.getState().accessToken;
        console.log("⏬ Expired token:", expiredToken);

        // ⏫ Send it in Authorization header
        const res = await rawAxios.post("/auth/refresh-token", null, {
          headers: {
            Authorization: `Bearer ${expiredToken}`,
          },
          withCredentials: true,
        });
        const newAccessToken = res.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);
        //  Update socket with new token
        useSocketStore.getState().reconnectWithNewToken(newAccessToken);

        const newUser = res.data.user;
        useAuthStore.getState().setAuthUser(newUser);

        // ⏩ Retry original request with new token
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        console.log("↩️ Session Restored");

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed", refreshError);

        try {
          await rawAxios.post("/auth/logout");
        } catch (logoutError) {
          console.error("Logout failed:", logoutError);
        }

        useAuthStore.getState().setAccessToken(null);
        useAuthStore.getState().setAuthUser(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;


// Explaination:
// Why Use rawAxios for /auth/refresh-token?
// Because axiosInstance has an interceptor, and that interceptor:

// Automatically adds your current (maybe expired) accessToken
// Might detect expiry and try to call /auth/refresh-token itself

