import { Box, Eye, EyeOff, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { handleApiError } from "../utils/errorHandler";

const Login = () => {
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn, TooManyAttempts } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      //  Wait for the API call to complete
      const response = await login(formData);

      if (response) {
        //  Only reset form if registration is successful
        setFormData({ email: "", password: "" });
         //  Reset form fields
      }
    } catch (error) {
      handleApiError(error); //  Show backend errors (but don't reset form)
    }
  };
  useEffect(() => {
  }, [formData]); //  Logs when formData actually updates
  
  return (
    <div className="grid min-h-fit place-items-center">
      <div className="min-w-fit max-w-xs text-base-content text-center rounded-xl shadow-lg">
        <div className="logo flex justify-center items-center mb-5 mt-5">
          <Box className="size-10 text-secondary-content" />
        </div>
        <div className="main-text">
          <h1 className="mb-1 text-2xl font-bold text-base-content">
            Welcome back
          </h1>
          <p className="text-sm text-base-content/70 tracking-tight">
            Sign in to your account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8">
          <div className="mb-4">
            <label
              className="flex text-base-content/90 text-sm font-medium  mb-1"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="appearance-none border border-base-content/15 rounded w-80 py-2 px-3 text-sm text-base-content/65 leading-tight focus:outline-none focus:shadow-outline shadow-none placeholder:text-base-content/30 placeholder:text-sm"
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
              className="flex text-base-content/90 text-sm font-medium mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`appearance-none border border-base-content/15 rounded w-80 py-2 px-3 text-sm text-base-content/65 leading-tight focus:outline-none focus:shadow-outline shadow-none placeholder:text-base-content/30 placeholder:text-sm`}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye className="h-5 w-5 text-base-content/40" />
                ) : (
                  <EyeOff className="h-5 w-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>

          <div className="button">
            <Link
              to={"/forgot-password"}
              className="flex justify-end text-secondary-content align-baseline text-sm mb-3 tracking-tight"
            >
              Forgot password?
            </Link>
            <button
              className="flex justify-center items-center w-full mb-7 bg-secondary-content text-white text-sm py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline cursor-pointer hover:bg-[#4d40de] disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoggingIn || TooManyAttempts}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                </>
              ) : (
                "Sign In"
              )}
            </button>
            <hr className="border border-base-content/15" />
            <p className="mt-3 inline-block align-baseline text-sm text-base-content/70 tracking-tight">
              Don't have an account?{" "}
              <Link
                to={"/register"}
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
