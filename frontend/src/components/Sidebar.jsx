import { AlignLeft, ChartLine, ListTodo } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";

const Sidebar = () => {
  const { logout } = useAuthStore();
  const { hasNewNotification } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      icon: <ChartLine strokeWidth={3} className="size-4" />,
      to: "/",
    },
    {
      label: "Projects",
      icon: (
        <span className="material-symbols-outlined !text-[18px]">folder</span>
      ),
      to: "/projects",
    },
    {
      label: "Tasks",
      icon: <ListTodo strokeWidth={3} className="size-4" />,
      to: "/tasks",
    },
    {
      label: "Team Members",
      icon: (
        <span className="material-symbols-outlined !text-[18px]">groups</span>
      ),
      to: "/team",
    },
    {
      label: "Notifications",
      icon: (
        <>
          <span className="relative material-symbols-outlined !text-[18px]">
            notifications
          </span>
          {hasNewNotification && (
            <div className="absolute transform translate-x-2.5 -translate-y-1 block h-2.5 w-2.5 rounded-full bg-primary"></div>
          )}
        </>
      ),
      to: "/notifications",
    },
    {
      label: "Settings",
      icon: (
        <span className="material-symbols-outlined !text-[18px]">settings</span>
      ),
      to: "/settings",
    },
    {
      label: "Archive",
      icon: (
        <span className="material-symbols-outlined !text-[18px]">archive</span>
      ),
      to: "/archive",
    },
  ];
  return (
    <>
      {/* Hamburger icon for mobile */}
      <div
        className="fixed top-5 left-4 z-80 block cursor-pointer lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <AlignLeft />
      </div>
      <div className="overflow-hidden">
        {/* Sidebar */}
        <div
          className={`bg-base-100 fixed top-0 left-0 z-60 h-screen transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } border-base-content/15 w-4/5 border-r-1 md:w-64 lg:static lg:z-auto lg:w-55 lg:translate-x-0`}
        >
          <div className="mt-15 flex px-3 sm:px-5 md:px-3 lg:mt-0 lg:px-6">
            <div className="flex items-center gap-2 lg:mt-8">
              <div className="size-9 overflow-hidden rounded-full bg-white">
                <img
                  src="/vite.svg"
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="desc">
                <p className="text-base-content text-md font-semibold">
                  Sarah Conor
                </p>
                <p className="text-base-content/60 text-xs font-medium">
                  Project Manager
                </p>
              </div>
            </div>
          </div>

          <div className="content-wrapper flex h-[calc(100%-6rem)] flex-grow flex-col justify-between">
            {/* removing overflow-y-auto from here*/}
            <div className="list text-base-content/80 mt-5 gap-y-2 p-3 text-sm font-medium sm:px-5">
              {navItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-5 rounded-md px-3 py-2 transition-all duration-300 ease-in-out ${
                      isActive
                        ? "bg-active-blue text-blue"
                        : "text-base-content/80 hover:bg-base-300/30 bg-transparent"
                    }`
                  }
                >
                  {item.icon}
                  <p>{item.label}</p>
                </NavLink>
              ))}
            </div>
            <div className="logout mt-5 p-5 sm:mt-27">
              <button
                className="text-base-content/90 bg-base-200 flex w-full items-center justify-center gap-x-2 rounded-sm px-3 py-2.5 text-sm font-medium"
                onClick={logout}
              >
                <span className="material-symbols-outlined !text-[18px] !font-bold">
                  logout
                </span>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default Sidebar;
