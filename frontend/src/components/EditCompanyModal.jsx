import { useState, useEffect } from "react";

import { useCompanyStore } from "../store/useCompanyStore";
import { useAuthStore } from "../store/useAuthStore";
import { refreshAuthUser } from "../utils/refreshAuthUser";

import log from "../utils/logger";
import { toast } from "sonner";

const EditCompanyModal = ({ isOpen, onClose }) => {
  const { fetchCompanyInfo, companyInfo, updateCompany } = useCompanyStore();
  const { authUser } = useAuthStore();
  const companyId = authUser?.activeCompany;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    website: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
        log("Fetching Company Info")
      fetchAndSetCompany();
    }
  }, [isOpen]);

  const fetchAndSetCompany = async () => {
    const companyData = await fetchCompanyInfo(companyId);
    if (companyData) {
        setFormData({
          name: companyData.name || "",
          description: companyData.description || "",
          location: companyData.location || "",
          website: companyData.website || "",
        });
      }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCompany(companyId, formData);
      await refreshAuthUser();
      toast.success("Company updated successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update company");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-2xl bg-base-100">
            <h3 className="mb-4 text-lg font-bold">Edit Company Information</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-base-content/70">Company Name</label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered w-full focus:outline-none"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-sm text-base-content/70">Description</label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full focus:outline-none"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                ></textarea>
              </div>

              <div>
                <label className="text-sm text-base-content/70">Location</label>
                <input
                  type="text"
                  name="location"
                  className="input input-bordered w-full focus:outline-none"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-sm text-base-content/70">Website</label>
                <input
                  type="text"
                  name="website"
                  className="input input-bordered w-full focus:outline-none"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="btn btn-ghost"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {/* Close button top right */}
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle absolute right-2 top-2"
            >
              ✕
            </button>
          </div>

          {/* Modal background overlay */}
          <div className="modal-backdrop" onClick={onClose}></div>
        </div>
      )}
    </>
  );
};

export default EditCompanyModal;

