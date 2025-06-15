import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

import ThemeToggle from "./ThemeToggle";
import EditCompanyModal from "./EditCompanyModal";
import { RBAC } from "../utils/rbac";

import { PencilLine } from "lucide-react";

const MinimalNavbar = ({ padding = "p-5 md:p-18", name }) => {
  const { authUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const heading = name
    ? name
    : authUser?.activeCompanyName
      ? authUser.activeCompanyName
      : "";
  const role = authUser?.role;

  return (
    <div className="navbar border-base-content/10 h-12 border-b">
      {/* Header */}
      <div className={`flex w-full items-center justify-between ${padding}`}>
        <div className="flex items-center">
          {authUser.companyId && (
            <h3 className="text-md ml-5 font-semibold md:ml-0 md:text-xl">
              {heading}
              {"'s"}
              {"  "}
              WorkSpace
            </h3>
          )}

          <RBAC role={role} action="edit_company">
            <button
              onClick={() => setIsOpen(true)}
              className="ml-1 -translate-y-2 transform cursor-pointer p-1 hover:scale-110 hover:bg-transparent"
            >
              <PencilLine className="text-base-content/40 size-4.5" />
            </button>
          </RBAC>
        </div>
        <div className="flex items-center">
          <div className="theme-toggle p-2 hover:scale-120 hover:transform">
            <ThemeToggle
              className="text-base-content/70 md:text-base-content/50"
              className2="size-7 md:size-6"
            />
          </div>
          {authUser && (
            <div className="size-8 overflow-hidden rounded-full md:size-8">
              <img
                className="size-8 object-cover"
                src={authUser.profilePicture}
                alt="user1"
              />
            </div>
          )}
        </div>
      </div>
      <EditCompanyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default MinimalNavbar;
