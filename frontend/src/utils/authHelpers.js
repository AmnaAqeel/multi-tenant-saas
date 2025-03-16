import { useAuthStore } from "../store/useAuthStore";

export const getAccessTokenFromState = () => {
    return useAuthStore.getState().accessToken;
}