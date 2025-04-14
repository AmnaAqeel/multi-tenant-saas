import { Building2, Search } from "lucide-react";
import { useCompanyStore } from "../store/useCompanyStore";

const Card = () => {
      const { setShowSearch } = useCompanyStore();
  return (
    <>
    {/* remove bg-base-200 and shadow-xl */}
       <div className="bg-base-100 w-full max-w-xl rounded-2xl p-8 text-center">
          <img
            src="/teamwork.svg"
            alt="No Company"
            className="mx-auto mb-8 h-45 w-45"
          />

          <h2 className="text-base-content mb-6 text-xl font-bold md:text-2xl">
            You're Not Part of a Company Yet
          </h2>

          <p className="text-base-content/80 mb-10 text-base">
            Welcome, <span className="font-semibold italic"> Sarah </span>👋{" "}
            <br />
            {/* It looks like you haven't joined or created a company yet. <br /> */}
             To get
            started, please choose one of the options below.
          </p>

          <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              aria-label="Create Company"
              onClick={() => document.getElementById("my_modal_1")?.showModal()}
              className="btn btn-primary text-content flex w-full items-center justify-center gap-2 sm:w-auto transform hover:scale-103 transition duration-200"
            >
              <Building2 className="h-4 w-4 -translate-y-[1px]" />
              Create Company
            </button>

            <button
              aria-label="Search for a Company"
              onClick={() => setShowSearch(true)}
              className="btn btn-outline hover:bg-base-200 flex w-full items-center justify-center gap-2 shadow-sm sm:w-auto transform hover:scale-103 transition duration-200"
            >
              <Search className="h-4 w-4" />
              Search for a Company
            </button>
          </div>

          <p className="text-base-content/60 text-xs">
            Need help? Ask a team member to invite you to their company.
          </p>
        </div>
    </>
  )
}

export default Card
