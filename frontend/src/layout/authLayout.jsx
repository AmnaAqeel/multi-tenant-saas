import { Outlet, Navigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle"; // Import the theme toggle
import {useAuthStore} from "../store/useAuthStore";
import {Loader} from "../components/Loader";

export default function AuthLayout() {
  const { authUser, accessToken, isCheckingAuth, hasCheckedAuth } = useAuthStore();
    // 🕒 Still checking auth → show loader
    if (isCheckingAuth || !hasCheckedAuth) {
      return (
        <Loader />
      );
    }
  
    // ✅ Already logged in → redirect to dashboard
    if (authUser || accessToken) {
      return <Navigate to="/" replace />;
    }
  
    return (
      <div className="flex h-screen items-center justify-center bg-base-200">
          {/* Theme Toggle Button at the Top */}
          <div className="flex justify-end mb-4">
            <ThemeToggle className="fixed top-2 right-1 md:top-4 md:right-5 p-4 lg:p-2.5 shadow-2xl rounded-full hover:bg-muted transition" className2="h-6 w-6 md:h-8 md:w-8"/>
          </div>
  
          {/* Dynamic Page Content */}
          <Outlet /> {/* This renders Login, Signup, Forgot Password, etc. */}
      </div>
    );
}