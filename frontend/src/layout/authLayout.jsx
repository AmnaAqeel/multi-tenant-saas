import { Outlet } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle"; // Import the theme toggle

export default function AuthLayout() {
    return (
      <div className="flex h-screen items-center justify-center bg-base-200">
          {/* Theme Toggle Button at the Top */}
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
  
          {/* Dynamic Page Content */}
          <Outlet /> {/* This renders Login, Signup, Forgot Password, etc. */}
      </div>
    );
}