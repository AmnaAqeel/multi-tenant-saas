import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff } from "lucide-react"; // Import icons
import { handleApiError } from "../utils/errorHandler";
import { ButtonLoader } from "../components/Loader";

const ResetPassword = () => {
  const [passwordsMatch, setPasswordsMatch] = useState(null); //  Track match status

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData((prev) => ({ ...prev, password }));
  
    //  Ensure live checking works even if confirmPassword is not changed
    setPasswordsMatch(password === formData.confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value.trim(); // Remove spaces from start/end
  
    setFormData((prev) => {
      const updatedData = { ...prev, confirmPassword }; // Create updated state
  
      //  Compare new confirmPassword with the latest stored password
      setPasswordsMatch(confirmPassword === prev.password);
  
      return updatedData; // Return updated state for React to store
    });
  };
  

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const { isResettingPassword, resetPassword, TooManyAttempts } =
    useAuthStore();
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (isDisabled) return; //  Prevent multiple clicks

    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token"); //  Extract token from URL

      if (!token) {
        toast.error("Invalid or missing token.");
        return;
      }
      const response = await resetPassword(formData.password, token); //  Send token separately
      if (response) {
        setFormData({ password: "", confirmPassword: "" });
      }

      //  Set cooldown before allowing another request
      setTimeout(() => setIsDisabled(false), 20000); // 20 seconds cooldown to 2 mins
    } catch (error) {
      handleApiError(error);
      setIsDisabled(false); //  Re-enable button if request fails
    }
  };


  return (
    <div className="grid min-h-fit place-items-center">
      <div className="min-w-fit max-w-xs text-base-content text-center rounded-xl shadow-lg">
        <h2 className="mb-2 text-2xl font-bold">Reset Your Password</h2>
        <p className="text-sm text-gray-500">Enter your new password below</p>

        <form onSubmit={handleSubmit} className="mt-4 px-7 pt-6 pb-8">
          {/* 🔹 New Password Input */}
          <div className="mb-4">
            <label className="flex text-sm font-medium mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="appearance-none border border-base-content/15 rounded w-80 py-2 px-3 text-sm text-base-content/65 leading-tight focus:outline-none focus:shadow-outline shadow-none placeholder:text-base-content/30 placeholder:text-sm"
                value={formData.password}
                onChange={handlePasswordChange}
                onCopy={(e) => e.preventDefault()} //  Disable copying
                autoComplete="new-password"
                placeholder="New Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* 🔹 Confirm Password Input */}
          <div className="mb-5">
            <label className="flex text-sm font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="appearance-none border border-base-content/15 rounded w-80 py-2 px-3 text-sm text-base-content/65 leading-tight focus:outline-none focus:shadow-outline shadow-none placeholder:text-base-content/30 placeholder:text-sm"
                value={formData.confirmPassword}
                onChange={handleConfirmPasswordChange}
                onPaste={(e) => e.preventDefault()} //  Disable paste
                autoComplete="new-password"
                placeholder="Confirm Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
              {/*  Password Match Indicator (Beautiful UI) */}
              {formData.confirmPassword && (
                <span
                  className={`absolute inset-y-0 right-10 flex items-center transition-opacity duration-200 ${
                    passwordsMatch
                      ? "text-green-500 opacity-100 scale-110"
                      : "text-red-500 opacity-100 scale-100"
                  }`}
                >
                  {passwordsMatch ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 11.086l6.293-6.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.343 6.343a1.5 1.5 0 012.122 0L12 9.879l3.536-3.536a1.5 1.5 0 112.122 2.122L14.121 12l3.536 3.536a1.5 1.5 0 01-2.122 2.122L12 14.121l-3.536 3.536a1.5 1.5 0 01-2.122-2.122L9.879 12 6.343 8.464a1.5 1.5 0 010-2.122z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* 🔹 Reset Password Button */}
          <button
            className="flex justify-center items-center w-full bg-blue-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            type="submit"
            disabled={isResettingPassword || TooManyAttempts}
          >
            {isResettingPassword ? (
              <ButtonLoader />
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
