import { toast } from "sonner";
import { useAuthStore } from "../store/useAuthStore";


// export const handleApiError = (error) => {
//   console.error("Full Error:", error); //  Log the full error object for debugging

//   if (error.response) {
//     const { status, data } = error.response;

//     //Limiting attempts
//     if (status === 429) {
//       toast.error("Too many login attempts. Try again later.");
//       useAuthStore.getState().setTooManyAttempts(true); //  Disable login button

//       //  Automatically reset after the backend cooldown (e.g., 15 min)
//       setTimeout(() => {
//         useAuthStore.getState().setTooManyAttempts(false);
//         toast.success("You can try logging in again.");
//       }, 15 * 60 * 1000); // 15 minutes (same as backend)
      
//       return;
//     }

//     //  Handle Validation Errors (400)
//     if (status === 400 && data.errors) {
//       toast.error(data.errors[0].msg); //  Show the first validation error
//     } 
//     //  Handle Server Errors (500)
//     else if (status === 500) {
//       toast.error("Something went wrong! Please try again later.");
//     } 
    
//     //  Handle Other Errors (e.g., 401, 403, 404)
//     else {
//       toast.error(data.message || "An error occurred.");
//     }
//   } else {
//     //  Handle Network Errors
//     toast.error("Network error! Check your internet connection.");
//   }
// };

export const handleApiError = (error) => {
  console.error("📦 Full Error:", error);

  const authStore = useAuthStore.getState();

  // 🛑 Network Error (no response from server at all)
  if (!error.response) {
    if (error.message === "Network Error") {
      toast.error(" Network error! Please check your internet connection.");
    } else {
      toast.error(error.message || "Something went wrong. Try again.");
    }
    return;
  }

  // ✅ Extract server response
  const { status, data } = error.response;

  switch (status) {
    case 400:
      if (data.errors && data.errors.length > 0) {
        toast.error(data.errors[0].msg); // First validation error
      } else {
        toast.error(data.message || "Invalid request.");
      }
      break;

    case 401:
      toast.error(data.message || "Unauthorized. Please log in.");
      // Optional: Reset auth store or redirect to login if needed
      break;

    case 403:
      toast.error(data.message || "You do not have permission.");
      break;

    case 404:
      toast.error(data.message || "Resource not found.");
      break;

    case 429:
      toast.error("⏳ Too many attempts. Please wait.");
      authStore.setTooManyAttempts(true);
      setTimeout(() => {
        authStore.setTooManyAttempts(false);
        toast.success("You can try again now.");
      }, 15 * 60 * 1000); // match backend rate limit
      break;

    case 500:
      toast.error(" Server error. Try again later.");
      break;

    default:
      toast.error(data.message || "An unexpected error occurred.");
  }
};


