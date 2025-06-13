import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { handleApiError } from "../utils/errorHandler";
import { useAuthStore } from "../store/useAuthStore";
import { ButtonLoader } from "../components/Loader";

import log from "../utils/logger";

import { Box, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate(); 
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn, TooManyAttempts } =
    useAuthStore();

    const handleSubmit = async (e) => {
      e.preventDefault();
    
      try {
        log("user tried to login, sending data...")
        const response = await login(formData);
        log("user logged in successfully...")
        if (response) {
          setFormData({ email: "", password: "" });
    
          //  Invite redirect logic here
          const redirectPath = localStorage.getItem("postLoginRedirect");
          const inviteToken = localStorage.getItem("inviteToken");
          
          if (inviteToken && redirectPath?.startsWith("/invite/")) {
            log("special user case, came from invite...")
            localStorage.removeItem("inviteToken");
            localStorage.removeItem("postLoginRedirect");
            log("All the formalities done, taking him to invite page...")
            navigate(`/company-invite/${inviteToken}`);
          } else {
            log("normal user, taking him to dashboard...") 
            navigate("/");
          }
        }
      } catch (error) {
        handleApiError(error); // Show backend errors (but don't reset form)
      }
    };

  return (
    <div className="grid min-h-fit place-items-center">
      <div className="max-w-xs text-center shadow-lg text-base-content min-w-fit rounded-xl">
        <div className="flex items-center justify-center mt-5 mb-5 logo">
          <Box className="text-secondary-content size-10" />
        </div>
        <div className="main-text">
          <h1 className="mb-1 text-2xl font-bold text-base-content">
            Welcome back
          </h1>
          <p className="text-sm tracking-tight text-base-content/70">
            Sign in to your account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8">
          <div className="mb-4">
            <label
              className="flex mb-1 text-sm font-medium text-base-content/90"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="px-3 py-2 text-sm leading-tight border rounded shadow-none appearance-none border-base-content/15 text-base-content/65 focus:shadow-outline placeholder:text-base-content/30 w-80 placeholder:text-sm focus:outline-none"
              id="email"
              type="email"
              placeholder="john@example.com"
              autoComplete="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="mb-5">
            <label
              className="flex mb-1 text-sm font-medium text-base-content/90"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`border-base-content/15 text-base-content/65 focus:shadow-outline placeholder:text-base-content/30 w-80 appearance-none rounded border px-3 py-2 text-sm leading-tight shadow-none placeholder:text-sm focus:outline-none`}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye className="w-5 h-5 text-base-content/40" />
                ) : (
                  <EyeOff className="w-5 h-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>

          <div className="button">
            <Link
              to={"/forgot-password"}
              className="flex justify-end mb-3 text-sm tracking-tight align-baseline text-secondary-content"
            >
              Forgot password?
            </Link>
            <button
              className="bg-secondary-content focus:shadow-outline mb-7 flex w-full cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-sm text-white hover:bg-[#4d40de] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={isLoggingIn || TooManyAttempts}
            >
              {isLoggingIn ? (
                <>
                  {/* <LoaderCircle className="size-5 animate-spin" /> */}
                  <ButtonLoader />
                </>
              ) : (
                "Sign In"
              )}
            </button>
            <hr className="border border-base-content/15" />
            <p className="inline-block mt-3 text-sm tracking-tight align-baseline text-base-content/70">
              Don't have an account?{" "}
              <Link
                to={"/signup"}
                className="font-medium text-secondary-content"
              >
                Sign up?
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
