import axios from "axios";

//TODO: review setting cookie and authoruzation headers

const refreshAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "/api",
  withCredentials: true, // Ensures cookies (refresh token) are sent
});

export default refreshAxiosInstance;
