import {
  ArrowLeftRight,
  ChevronDown,
  Search,
  Settings,
  UserRound,
  UserPlus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import ThemeToggle from "../components/ThemeToggle";

import { useAuthStore } from "../store/useAuthStore";
import { useCompanyStore } from "../store/useCompanyStore";
import { useNotificationStore } from "../store/useNotificationStore";

import CreateCompanyModal from "./CreateCompanyModal";
import SwitchCompanyModal from "./SwitchCompanyModal";
import CompanyInviteModal from "./InviteUserModal";

import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const Navbar = ({ setShowSwitchModal, showSwitchModal }) => {
  const { logout, authUser } = useAuthStore();
  const { showSearch, setShowSearch } = useCompanyStore();
  const {
    notification,
    newNotification,
    setNewNotification,
    filteredNotification,
  } = useNotificationStore();

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  //  First add state at the component level
  const [expandedNotifications, setExpandedNotifications] = useState([]);

  // Toggle function
  const handleToggle = (index) => {
    setExpandedNotifications((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      try {
        const segments = searchQuery.trim().split("/");
        const token = segments[segments.length - 1]; // Extract last part (token)

        if (token && token.length === 36) {
          // Assuming UUID format (36 chars)
          navigate(`/company-invite/${token}`);
        } else {
          toast.error("Invalid invite link! Please enter a valid URL.");
        }
      } catch (err) {
        toast.error("Invalid URL format! Please enter a proper invite link.");
      }
    }
  };

  useEffect(() => {
    let timeoutId;
    if (showSearch) {
      inputRef.current?.focus();
    }

    if (showSearch) {
      // Delay attaching the listener to avoid the "immediate hide" bug
      timeoutId = setTimeout(() => {
        window.addEventListener("click", handleClickOutside);
      }, 0);
    }

    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("click", handleClickOutside);
    };
  }, [showSearch]);

  useEffect(() => {
    const hasUnread = filteredNotification.some((n) => !n.read);
    setNewNotification(hasUnread);
  }, [filteredNotification, setNewNotification]);

  return (
    <>
      {/* Navbar */}
      <div className="border-base-content/15 navbar h-10 w-full items-center justify-between border-b">
        {/* Search bar P1*/}
        <div
          className={`searchbar border-base-content/15 relative ml-8 flex w-85 rounded-md border-0 md:ml-4 md:border ${showSearch ? "block border-2 border-amber-100" : ""}`}
          ref={searchRef}
        >
          {showSearch && (
            <Search
              className="md:text-base-content/30 absolute top-1.5 left-2 hidden size-5 md:block"
              strokeWidth={3}
            />
          )}
          <input
            type="text"
            className={`text-base-content/40 placeholder:text-base-content/30 ml-8 w-full rounded-r-md p-2 text-sm font-medium transition-all duration-300 outline-none placeholder:text-sm md:w-full ${showSearch ? "block" : "hidden"} md:block`}
            placeholder="Search to join company..."
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            onKeyDown={handleSearch}
            ref={inputRef}
          />
          {!showSearch && (
            <Search
              className="text-base-content/70 md:text-base-content/30 absolute -top-5 left-8 mr-3 size-10 p-2 md:top-0 md:left-0 md:size-9"
              strokeWidth={3}
              onClick={() => setShowSearch((prev) => !prev)}
            />
          )}
        </div>

        {/* Nav links P2 */}
        <div className="navlinks flex items-center justify-center gap-3 md:mr-2">
          {/* Theme Toggle */}
          <div className="theme-toggle p-2 hover:scale-120 hover:transform md:mr-3">
            <ThemeToggle
              className="text-base-content/70 md:text-base-content/50"
              className2="size-7 md:size-6"
            />
          </div>

          {/* Notification X profile */}

          <div className="flex gap-x-3">
            {/* Notification dropdown */}
            <div className="dropdown dropdown-bottom dropdown-end hidden items-center justify-center md:flex">
              <div
                tabIndex={0}
                role="button"
                className="text-base-content/55 hover:text-base-content/40 relative inline-flex cursor-pointer items-center text-center text-sm font-medium focus:outline-none"
              >
                {" "}
                <svg
                  className="h-5 w-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 14 20"
                >
                  <path d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z" />
                </svg>
                {newNotification && (
                  <div className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500"></div>
                )}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 z-10 w-80 overflow-hidden rounded-lg shadow-lg"
              >
                <div className="menu-title text-base-content p-4 pb-2 font-semibold">
                  Notifications
                </div>

                {notification.length ? (
                  notification.slice(0, 3).map((each, index) => (
                    <li
                      key={each._id}
                      className="hover:bg-neutral/10 border-base-200 cursor-pointer border-b px-4 py-3 transition last:border-0"
                      onClick={() => handleToggle(index)}
                    >
                      <div
                        className={`w-full flex-1 ${each.read ? "bg-base-100" : "bg-primary/7"}`}
                      >
                        <div
                          className={`text-base-content text-sm font-medium ${
                            expandedNotifications[index] ? "" : "line-clamp-2"
                          }`}
                        >
                          {each.message}
                        </div>

                        <div className="mt-1 flex items-center justify-between">
                          <div className="flex-1" />
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(each.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <div className="text-base-content/60 p-4 text-sm">
                    No notifications yet
                  </div>
                )}
              </ul>
            </div>

            {/* Profile-menu */}
            <div className="profile-dropdown flex items-center justify-center md:gap-x-1">
              {/* Profile rounded */}
              <div className="size-8 overflow-hidden rounded-full bg-pink-100 md:size-7.5">
                <img
                  src={authUser.profilePicture}
                  className="size-8 rounded-full"
                />
              </div>

              {/* menu dropdown */}
              <div className="dropdown dropdown-bottom dropdown-end md:block">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn no-focus mt-1.5 border-0 bg-transparent p-2 shadow-none hover:bg-transparent focus:bg-transparent"
                >
                  <ChevronDown className="text-base-content/60 size-6 hover:scale-130 hover:transform md:size-5" />
                </div>
                <ul
                  tabIndex={0}
                  role="menu"
                  aria-label="User menu"
                  className="dropdown-content menu bg-base-100 rounded-box text-base-content/80 z-1 w-52 gap-y-1 p-2 shadow-sm"
                >
                  {/* Profile Header */}
                  <div className="border-base-content/15 space-y-0.5 border-b px-3 py-2 text-sm">
                    <div className="text-base-content font-medium">
                      {authUser.name}
                    </div>
                    <div className="text-base-content/70 truncate text-xs">
                      {authUser.email}
                    </div>
                  </div>

                  {/* Menu Items */}

                  {/* profile */}
                  <div className="border-base-content/15 mt-1 border-b">
                    {/* <li role="menuitem" className="hover:bg-base-200">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 text-sm"
                      >
                        <UserRound className="size-4" /> Profile
                      </Link>
                    </li> */}

                    {/* New Company */}
                    <li role="menuitem" className="hover:bg-base-200">
                      <button
                        className="flex items-center gap-1.5 text-sm"
                        onClick={() => {
                          const scrollbarWidth =
                            window.innerWidth -
                            document.documentElement.clientWidth;
                          document.documentElement.style.setProperty(
                            "--scrollbar-width",
                            `${scrollbarWidth}px`,
                          );
                          setShowCompanyModal(true);
                        }}
                      >
                        <span className="material-symbols-outlined !text-[20px]">
                          corporate_fare
                        </span>
                        New Company
                      </button>
                    </li>

                    {/* Switch Company */}
                    <li role="menuitem" className="hover:bg-base-200">
                      <button
                        className="flex items-center gap-2 text-sm"
                        onClick={() => setShowSwitchModal(true)}
                      >
                        <ArrowLeftRight className="size-4" />
                        Switch Company
                      </button>
                    </li>

                    {/* Invite User */}
                    {authUser.companyId && (
                      <li role="menuitem" className="hover:bg-base-200">
                        <button
                          className="flex items-center gap-2 text-sm"
                          onClick={() => {
                            const scrollbarWidth =
                              window.innerWidth -
                              document.documentElement.clientWidth;
                            document.documentElement.style.setProperty(
                              "--scrollbar-width",
                              `${scrollbarWidth}px`,
                            );
                            setShowInviteModal(true);
                          }}
                        >
                          <UserPlus className="size-4" />
                          Invite User
                        </button>
                      </li>
                    )}

                    {/* settings */}
                    <li role="menuitem" className="hover:bg-base-200">
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 text-sm"
                      >
                        <Settings className="size-4" />
                        Settings
                      </Link>
                    </li>
                  </div>

                  {/* Logout */}
                  <li role="menuitem" className="hover:bg-base-200">
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="material-symbols-outlined !text-[19px]">
                        logout
                      </span>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <CreateCompanyModal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
      />

      <SwitchCompanyModal
        isOpen={showSwitchModal}
        onClose={() => setShowSwitchModal(false)}
      />

      <CompanyInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </>
  );
};

export default Navbar;
