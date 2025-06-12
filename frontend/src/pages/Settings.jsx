import { useState } from "react";
import MinimalNavbar from "../components/MinimalNavbar";
import { useAuthStore } from "../store/useAuthStore";
import { useCompanyStore } from "../store/useCompanyStore";
import { refreshAuthUser } from "../utils/refreshAuthUser";
import ConfirmModal from "../components/ConfirmModal";

import { ButtonLoader } from "../components/Loader";

import { toast } from "sonner";

const Settings = () => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const { deleteCompany,leaveCompany } = useCompanyStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const {role} = authUser;


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: validate file type if you want
    // if (!file.type.startsWith("image/")) {
    //   toast.error("Please select a valid image file");
    //   return;
    // }

    setSelectedImage(file);
  };

  const handleImageUpload = async (e) => {
    if (!selectedImage) return; // If no file, exit

    const reader = new FileReader(); // Create FileReader
    reader.readAsDataURL(selectedImage); // Read file as Base64

    reader.onload = async () => {
      // Wait for file to finish loading
      const base64Image = reader.result; // Store Base64 data
      await updateProfile({ profilePic: base64Image }); // Send to backend
      // Update State:
      setSelectedImage(null);
      await refreshAuthUser(); // Refresh authUser
      
    };
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    try {
     const response = await deleteCompany(authUser.activeCompany); 
      if (response) toast.success("Project deleted");
    } catch (err) {
      toast.error("Delete failed");
      console.error(err);
    }
  };

  const handleConfirmLeave = async () => {
    setShowLeaveModal(false);
    try {
      // deleteCompanyApi(projectToDelete); Manage State here
      await leaveCompany(authUser.activeCompany);
      toast.success("Company left successfully!");
    } catch (err) {
      toast.error("Delete failed");
      console.error(err);
    }
  };

  return (
    <>
      <MinimalNavbar padding="p-5" />
      <div className="bg-base-200 min-h-screen px-8 py-4">
        <div className="mb-4">
          <h1 className="text-base-content text-2xl font-bold">Settings</h1>
          <p className="text-base-content/70">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Card Parent  */}
        <div>
          {/* Content */}
          <div className="flex w-full flex-col gap-8">
            {/* Profile Settings */}
            <div className="rounded-box bg-base-100 p-6 shadow-xs">
              <h2 className="mb-4 text-lg font-semibold">Profile Settings</h2>
              <div className="mb-6 flex items-center gap-4">
                <div className="avatar">
                  <div className="w-16 rounded-full">
                    <img
                      src={
                        selectedImage
                          ? URL.createObjectURL(selectedImage)
                          : authUser?.profilePicture
                      }
                      alt="Profile"
                    />
                  </div>
                </div>

                <div>
                  {selectedImage && !isUpdatingProfile ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleImageUpload}
                    >
                      Save Photo
                    </button>
                  ) : isUpdatingProfile ? (
                    <button className="btn btn-primary btn-sm" disabled>
                      <ButtonLoader />
                    </button>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <label
                        htmlFor="file-upload"
                        className="btn btn-outline btn-sm cursor-pointer"
                      >
                        Change Photo
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-base-content/70 text-sm">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full shadow-none focus:outline-none"
                    value="John Doe"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-base-content/70 text-sm">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="input input-bordered w-full focus:outline-none"
                    value="john@example.com"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Company Settings */}
            <div className="rounded-box bg-base-100 p-6 shadow-xs">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Company Settings</h2>
              </div>

              {/* Company Name Input */}
              <div className="space-y-4">
                <div>
                  <label className="text-base-content/70 text-sm">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full focus:outline-none"
                    value="Acme Inc"
                    readOnly
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-base-200 mt-8 flex justify-end border-t pt-6">
                {role === "admin" ? (
                  <button
                    className="btn btn-sm btn-outline border border-red-500 text-red-600 hover:bg-transparent"
                    onClick={() => setShowDeleteModal(true)}
                    >
                    Delete Company
                  </button>
                ) : (
                  <button className="btn btn-sm btn-outline border-red-500 text-red-600 hover:bg-transparent"
                    onClick={() => setShowLeaveModal(true)}
                  >
                    Leave Company
                  </button>
                )}
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="0 rounded-box bg-base-100 p-6 shadow-xs">
              <h2 className="mb-4 text-lg font-semibold">
                Notification Preferences
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Email Notifications</h4>
                    <p className="text-base-content/70 text-sm">
                      Receive email updates about your account
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    defaultChecked
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">In-app Notifications</h4>
                    <p className="text-base-content/70 text-sm">
                      Receive notifications within the application
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Company?"
        description="Are you sure you want to delete this Company? All projects and tasks under this project will also be permanently removed."
        confirmText="Delete"
      />
      <ConfirmModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleConfirmLeave}
        title="Leave Company?"
        description="Are you sure you want to Leave this Company?"
        confirmText="Leave"
      />
    </>
  );
};

export default Settings;
