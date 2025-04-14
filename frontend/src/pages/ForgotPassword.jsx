import { Box, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import { useAuthStore } from "../store/useAuthStore";
import { handleApiError } from "../utils/errorHandler";
import { ButtonLoader } from "../components/Loader";


const ForgotPassword = () => {
  const [formData, setFormData] = useState({ email: "" });
  const { forgotPassword, sendingEmail, TooManyAttempts } = useAuthStore();
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isDisabled) return; // ✅ Prevent multiple clicks

    setIsDisabled(true); // ✅ Disable button immediately

    try {
      //  Wait for the API call to complete
      const response = await forgotPassword(formData);

      if (response) {
        //  Only reset form if registration is successful
        setFormData({ email: "" }); //  Reset form fields
      }

      // ✅ Set cooldown before allowing another request
      setTimeout(() => setIsDisabled(false), 200000); // 20 seconds cooldown to 2 mins
    } catch (error) {
      handleApiError(error); //  Show backend errors (but don't reset form)
      setIsDisabled(false); // ✅ Re-enable button if request fails
    }
  };

  return (
    <div className="grid min-h-fit place-items-center">
      <div className="min-w-fit max-w-xs text-base-content text-center rounded-xl shadow-lg">
        <div className="logo flex justify-center items-center mb-5 mt-5">
          <Box className="size-10 text-secondary-content" />
        </div>
        <div className="main-text">
          <h1 className="mb-1.5 text-2xl font-bold text-base-content">
            Forgot your password?
          </h1>
          <p className="text-sm text-base-content/70">
            Enter your email to receive a reset link
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-2 px-7 pt-6 pb-8">
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
              autoComplete="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="button">
            <button
              className="flex justify-center items-center w-full mb-7 bg-secondary-content text-white text-sm py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline cursor-pointer hover:bg-[#4d40de] disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={sendingEmail || TooManyAttempts || isDisabled}
            >
              {sendingEmail ? (
                <>
                  <ButtonLoader />
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
            <hr className="border border-base-content/15" />
            <p className="mt-3 inline-block align-baseline text-sm text-base-content/70 tracking-tight">
              Remember your password?{" "}
              <Link
                to={"/signin"}
                className="font-medium text-secondary-content"
              >
                Sign in?
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
