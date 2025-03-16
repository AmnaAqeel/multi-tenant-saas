import { toast } from "sonner";
import { useAuthStore } from "../store/useAuthStore";


export const handleApiError = (error) => {
  console.error("Full Error:", error); //  Log the full error object for debugging

  if (error.response) {
    const { status, data } = error.response;

    //Limiting attempts
    if (status === 429) {
      toast.error("Too many login attempts. Try again later.");
      useAuthStore.getState().setTooManyAttempts(true); //  Disable login button

      //  Automatically reset after the backend cooldown (e.g., 15 min)
      setTimeout(() => {
        useAuthStore.getState().setTooManyAttempts(false);
        toast.success("You can try logging in again.");
      }, 15 * 60 * 1000); // 15 minutes (same as backend)
      
      return;
    }

    //  Handle Validation Errors (400)
    if (status === 400 && data.errors) {
      toast.error(data.errors[0].msg); //  Show the first validation error
    } 
    //  Handle Server Errors (500)
    else if (status === 500) {
      toast.error("Something went wrong! Please try again later.");
    } 
    
    //  Handle Other Errors (e.g., 401, 403, 404)
    else {
      toast.error(data.message || "An error occurred.");
    }
  } else {
    //  Handle Network Errors
    toast.error("Network error! Check your internet connection.");
  }
};

