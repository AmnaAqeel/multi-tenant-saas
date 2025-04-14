import { Box, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";
import { handleApiError } from "../utils/errorHandler";
import { ButtonLoader } from "../components/Loader";


const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { register, isRegistering, TooManyAttempts } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()){ toast.error("Full name is required"); return false};
    if (!formData.email.trim()) { toast.error("Email is required"); return false};
    if (!/\S+@\S+\.\S+/.test(formData.email)){toast.error("Invalid email format"); return false};
    if (!formData.password) {toast.error("Password is required"); return false};
    if (formData.password.length < 6)
      { toast.error("Password must be atleast 6 characters");
      return false;
      }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

     //  Run frontend validation before sending the request
    if (!validateForm()) return;

   try {
    //  Wait for the API call to complete
    const response = await register(formData, navigate);
    
    if (response) { //  Only reset form if registration is successful
      setFormData({ fullName: "", email: "", password: "" }); //  Reset form fields
    }
  } catch (error) {
    handleApiError(error); //  Show backend errors (but don't reset form)
  }
  };
  return (
    <div>
      <div className="grid min-h-fit place-items-center">
        <div className="min-w-fit max-w-xs text-base-content text-center rounded-xl shadow-lg">
          <div className="logo flex justify-center items-center mb-5 mt-5">
            <Box className="size-10 text-secondary-content" />
          </div>
          <div className="main-text">
            <h1 className="mb-1.5 text-2xl font-bold text-base-content">
              Create your account
            </h1>
            <p className="text-sm text-base-content/70 tracking-tight">
              create an account to get started
            </p>
          </div>
          <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8">
            <div className="mb-4">
              <label
                className="flex text-base-content/90 text-sm font-medium mb-1"
                htmlFor="fullName"
              >
                Full Name
              </label>
              <input
                className="appearance-none border border-base-content/15 rounded w-80 py-2 px-3 text-sm text-base-content/65 leading-tight focus:outline-none focus:shadow-outline shadow-none placeholder:text-base-content/30 placeholder:text-sm"
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label
                className="flex text-base-content/90 text-sm font-medium mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="appearance-none border border-base-content/15 rounded w-80 py-2 px-3 text-sm text-base-content/65 leading-tight focus:outline-none focus:shadow-outline shadow-none placeholder:text-base-content/30 placeholder:text-sm"
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                autoComplete="email"
              />
            </div>
            <div className="mb-8">
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
              <button
                className="flex justify-center items-center w-full mb-7 bg-secondary-content text-white text-sm py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline cursor-pointer hover:bg-[#4d40de] disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={(isRegistering ) || (TooManyAttempts)}
              >
                {isRegistering ? (
                  <>
                    <ButtonLoader />
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
              <hr className="border border-base-content/15" />
              <p className="mt-3 inline-block align-baseline text-sm text-base-content/70 tracking-tight">
                Already have an account?{" "}
                <Link
                  to={"/signin"}
                  className="font-medium text-secondary-content"
                >
                  Sign In?
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
