import { useAuthStore } from "../store/useAuthStore";

export const waitForToken = () => {
    return new Promise((resolve) => {
      const check = () => {
        const token = useAuthStore.getState().accessToken;
        if (token) return resolve(token);
        setTimeout(check, 50); // retry after 50ms
      };
      check();
    });
  };
  