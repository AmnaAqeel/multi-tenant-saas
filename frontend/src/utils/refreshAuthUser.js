import { rawAxios } from "../utils/axiosInstance";
import {useAuthStore} from "../store/useAuthStore"
import { useSocketStore } from "../store/useSocketStore";

export const refreshAuthUser = async () => {
  try {
    const expiredToken = useAuthStore.getState().accessToken;

    const res = await rawAxios.post("/auth/refresh-token", null, {
      headers: {
        Authorization: `Bearer ${expiredToken}`,
      },
      withCredentials: false, 
    });

    console.log("user's data has been refreshed");
    console.log("the response of refreshAuthUser :", res)

    const { accessToken, user } = res.data;

    // Update state with refreshed user + token
    useAuthStore.getState().setAccessToken(accessToken);
    useAuthStore.getState().setAuthUser(user);

    // Optional: Reconnect socket with new token
    useSocketStore.getState().reconnectWithNewToken(accessToken);

    return user;
  } catch (err) {
    console.error("🔁 Failed to refresh auth user:", err);
    throw err;
  }
};

//Explaination:
//For the refresh-user when you just want to update the authUser (token is not expired),
//first we don't need interceptor because if request fails and give 401, axiosInstance will keep on trying to refersh itself
//second we do not need to send the cookie, because our controller works that way 
//if no cookie it skips generating token and just returns the updated user
