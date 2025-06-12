import { ArrowLeftRight, Building2, Search } from "lucide-react";

import { useCompanyStore } from "../store/useCompanyStore";
import { useAuthStore } from "../store/useAuthStore";

import SwitchCompanyModal from "./SwitchCompanyModal";

const Card = ({ setShowSwitchModal, showSwitchModal }) => {
  const { setShowSearch } = useCompanyStore();
  const { authUser } = useAuthStore();
  const { companies } = authUser || {};
  const hasCompanies = Array.isArray(companies) && companies.length > 0;
  console.log("hasCompanies:", hasCompanies);
  return (
    <div className="bg-base-200 flex flex-grow items-center justify-center px-4 py-12">
      <div className="bg-base-100 w-full max-w-xl rounded-2xl p-8 text-center">
        <img
          src="/teamwork.svg"
          alt="No Company"
          className="mx-auto mb-8 h-45 w-45"
        />

        <h2 className="text-base-content mb-6 text-xl font-bold md:text-2xl">
          {hasCompanies
            ? "You're Not Actively in a Company"
            : "You're Not Part of a Company Yet"}
        </h2>

        <p className="text-base-content/80 mb-10 text-base">
          Welcome, <span className="font-semibold italic">Sarah</span> 👋 <br />
          {hasCompanies
            ? `Please switch to one of your existing companies to continue or create a new`
            : "To get started, please choose one of the options below."}
        </p>

        <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            aria-label="Create Company"
            onClick={() => document.getElementById("my_modal_1")?.showModal()}
            className="btn btn-primary text-content flex w-full transform items-center justify-center gap-2 transition duration-200 hover:scale-103 sm:w-auto"
          >
            <Building2 className="h-4 w-4 -translate-y-[1px]" />
            Create Company
          </button>

          <button
            aria-label="Search for a Company"
            onClick={() =>
              hasCompanies ? setShowSwitchModal(true) : setShowSearch(true)
            }
            className="btn btn-outline hover:bg-base-200 flex w-full transform items-center justify-center gap-2 shadow-sm transition duration-200 hover:scale-103 sm:w-auto"
          >
            {hasCompanies ? (
              <ArrowLeftRight className="size-4" />
            ) : (
              <Search className="size-4" />
            )}

            {hasCompanies ? "Switch Company" : "Search for a Company"}
          </button>
        </div>

        <p className="text-base-content/60 text-xs">
          Need help? Ask a team member to invite you to their company.
        </p>
      </div>
      <SwitchCompanyModal
        isOpen={showSwitchModal}
        onClose={() => setShowSwitchModal(false)}
      />
    </div>
  );
};

export default Card;
