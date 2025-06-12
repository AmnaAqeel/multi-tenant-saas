// components/CreateCompanyModal.jsx
import { useState } from "react";
import { toast } from "sonner";

import {ButtonLoader} from "../components/Loader"; 
import { useCompanyStore } from "../store/useCompanyStore";

const CreateCompanyModal = ({ isOpen, onClose }) => {
  const { registerCompany, isRegisteringCompany } =
  useCompanyStore();
  const [companyData, setCompanyData] = useState({
    name: "",
    logo: null,
    description: "",
    location: "",
    website: "",
    employees: "",
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("File too large");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64Image = reader.result;
      setCompanyData((prev) => ({ ...prev, logo: base64Image }));
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyData.name || !companyData.description) {
      toast.error("All fields are required");
      return;
    }

    const response = await registerCompany(companyData);
    if (response) {
      onClose();
      setCompanyData({
        name: "",
        logo: null,
        description: "",
        location: "",
        website: "",
        employees: "",
      });
    }
  };

  return (
    <dialog
      id="my_modal_1"
      className="modal"
      open={isOpen}
      onCancel={(e) => e.preventDefault()}
      onClose={() => {
        document.documentElement.style.removeProperty("--scrollbar-width");
        onClose();
      }}
    >
      <div className="modal-box w-full max-w-xl sm:w-11/12">
        <h3 className="mb-4 text-xl font-bold">Create a New Company</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">
              <span className="label-text">Company Name *</span>
            </label>
            <input
              type="text"
              className="input input-bordered focus:outline-none w-full"
              placeholder="e.g. Acme Inc."
              value={companyData.name}
              onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Logo (optional)</span>
            </label>
            <input
              type="file"
              className="file-input file-input-bordered focus:outline-none w-full"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full focus:outline-none"
              placeholder="e.g. We specialize in project collaboration..."
              value={companyData.description}
              onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Location</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full focus:outline-none"
              placeholder="e.g. San Francisco, CA"
              value={companyData.location}
              onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Website URL</span>
            </label>
            <input
              type="url"
              className="input input-bordered w-full focus:outline-none"
              placeholder="https://acmainc.com"
              value={companyData.website}
              onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
              pattern="^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,}(\/\S*)?$"
              title="Please enter a valid URL (e.g., https://example.com)"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Number of Employees</span>
            </label>
            <select
              className="select select-bordered w-full focus:outline-none"
              value={companyData.employees}
              onChange={(e) => setCompanyData({ ...companyData, employees: e.target.value })}
            >
              <option disabled value="">
                Select Range
              </option>
              {["1-10", "11-50", "51-200", "201-500", "500+"].map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={() => {
                document.getElementById("my_modal_1").close();
                onClose();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isRegisteringCompany}>
              {isRegisteringCompany ? (
                <>
                  <ButtonLoader /> Creating...
                </>
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default CreateCompanyModal;
