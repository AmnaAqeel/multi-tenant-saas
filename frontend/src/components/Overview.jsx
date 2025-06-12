import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";

import { Plus, Info, RotateCcw, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { useTaskStore } from "../store/useTaskStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { useProjectStore } from "../store/useProjectStore";
import { useAuthStore } from "../store/useAuthStore";

import StatusBadge from "../components/StatusBadge";
import { Loader } from "../components/Loader";

import { RBAC } from "../utils/rbac";

const Overview = () => {
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const { allProjects, fetchProjectsApi, setProjects } = useProjectStore();
  const { allTasks, fetchAllTasksApi } = useTaskStore();
  const {
    UnreadNotifications,
    setUnreadNotifications,
    notification,
    createAnnouncementApi,
    fetchSystemAnnouncements,
  } = useNotificationStore();
  const { authUser } = useAuthStore();
  const role = authUser?.role;

  const [loading, setLoading] = useState(true);

  // System Announcement states
  const [systemAnnouncement, setSystemAnnouncement] = useState([]);
  const [addAnnouncement, setAddAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");

  // Fetching Projects
  useEffect(() => {
    const fetchAll = async () => {
      console.log("Fetching projects...");
      const data = await fetchProjectsApi();
      console.log("All projects:", data);
      setProjects(data);
    };
    fetchAll();
  }, []);

  // Fetching Tasks
  useEffect(() => {
    const fetchTasks = async () => {
      fetchAllTasksApi();
    };
    fetchTasks();
  }, []);

  // Fetching Notifications
  useEffect(() => {
    const fetchUnread = async () => {
      setUnreadNotifications();
      setLoading(false);
    };

    fetchUnread();
  }, []);

  const allTeamMembers = allProjects?.reduce((acc, project) => {
    return acc.concat(project.teamMembers || []);
  }, []);

  // UseEffect to filter system notifications
  useEffect(() => {
    const fetchSystemAnn = async () => {
      const systemNotifs = await fetchSystemAnnouncements();
      setSystemAnnouncement(systemNotifs);
    };
    fetchSystemAnn();
  }, []);

  //click outside useEffect
  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log("Entered the handleClickOutside function");
      // Check if the click target is NOT within the button
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setAddAnnouncement(false); // Close the announcement
      }
    };

    // Add the event listener when the component mounts or when addAnnouncement is true
    if (addAnnouncement) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Remove the event listener when the component unmounts or when addAnnouncement is false
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [addAnnouncement]);

  const filteredNotification = notification.filter(
    (notif) =>
      notif.type === "user_joined" || notif.type === "project_restored",
  );

  console.log("Notifications: ", notification);

  // Add new announcement
  const handleAddAnnouncement = async () => {
    if (!announcementText.trim()) return;

    const response = await createAnnouncementApi(announcementText);
    console.log("Ok sent Api request");
    if (response) {
      console.log("response for system Announcements", response);
      toast.success("Announcement created successfully!");
      setSystemAnnouncement((prev) => [response, ...prev]);
      setAddAnnouncement(false);
      setAnnouncementText("");
    }
  };

  console.log("system Announcement: ", systemAnnouncement);
  console.log("allProjects", allProjects);

  if (loading) return <Loader />;

  return (
    <div className="bg-base-200 w-full p-6">
      <div className="header">
        <h1 className="text-base-content mb-0.5 text-2xl font-bold">
          <span>
            {authUser?.activeCompanyName || "Company Name"}
            {"'s"}
            {"  "}
          </span>
          Workspace
        </h1>
        <p className="text-base-content/60 text-sm">
          Welcome back, <span>{authUser.name}</span>!
        </p>
      </div>
      <div className="container mx-auto mt-4">
        {/* Header Section */}
        <div className="rounded-box mb-6 flex flex-col items-start justify-between gap-4 md:h-40 md:flex-row md:items-center">
          <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 md:h-30 md:gap-8">
            {/* Projects Stat */}
            <div className="bg-base-100 h-28 rounded-xl px-4 py-2 shadow-xs sm:px-6 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="text-base-content/70">Projects</div>
                <span className="material-symbols-outlined text-primary !text-[20px]">
                  folder
                </span>
              </div>
              <div className="stat-value text-base-content mt-2">
                {allProjects.length}
              </div>
            </div>

            {/* Tasks Stat */}
            <div className="bg-base-100 h-28 rounded-xl px-4 py-2 shadow-xs sm:px-6 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="text-base-content/70">Tasks</div>
                <span className="material-symbols-outlined text-indigo !text-[22px] !font-bold">
                  checklist
                </span>
              </div>
              <div className="stat-value text-base-content mt-2">
                {allTasks.length}
              </div>
            </div>

            {/* Team Members Stat */}
            <div className="bg-base-100 h-28 rounded-xl px-4 py-2 shadow-xs sm:px-6 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="text-base-content/70">Team Members</div>
                <span className="material-symbols-outlined !text-[22px] text-emerald-600">
                  groups
                </span>
              </div>
              <div className="stat-value text-base-content mt-2">
                {allTeamMembers?.length}
              </div>
            </div>

            {/* Notifications Stat */}
            <div className="bg-base-100 h-28 rounded-xl px-4 py-2 shadow-xs sm:px-6 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="text-base-content/70">Unread Notifications</div>
                <span className="material-symbols-outlined text-orange-500">
                  <svg
                    className="h-4.5 w-4.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 14 20"
                  >
                    <path d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z" />
                  </svg>
                </span>
              </div>
              <div className="stat-value text-base-content mt-2">
                {UnreadNotifications.length}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
          {/* Active Projects Card */}
          <div className="card bg-base-100 rounded-xl shadow-xs md:col-span-2 lg:col-span-1">
            <div className="card-body">
              <div className="mb-2 flex h-10 items-center justify-between">
                <h2 className="card-title text-base-content text-[18px] font-semibold">
                  Active Projects
                </h2>
                <button
                  className="text-blue mt-3 cursor-pointer p-1 text-[15px] hover:text-indigo-600"
                  onClick={() => navigate("/projects")}
                >
                  View All
                </button>
              </div>
              {allProjects?.length > 0 ? (
                allProjects?.slice(0, 2).map((project) => (
                  <div
                    key={project.id || project._id} // Assuming project object has an 'id' or '_id'
                    className="border-base-300 mb-2 rounded-lg border-b pb-4"
                  >
                    <div className="header flex justify-between">
                      <h3 className="text-base-content text-[16px] font-semibold max-w-[70%]">
                        {project.title}{" "}
                      </h3>
                      <StatusBadge 
                        status={project.status}
                        className="h-7! sm:h-auto"
                      />
                    </div>
                    {/* TeamMembers */}
                    <div className="flex items-center gap-2">
                      <div className="users flex -space-x-3">
                        {project.teamMembers?.map((member) => (
                          <div
                            key={member._id} // Use a unique key for each user
                            className="h-full w-full overflow-hidden rounded-full"
                          >
                            <img
                              className="size-6 object-cover"
                              src={member.user.profilePicture}
                              alt={member.user.fullName}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="text-base-content/70 text-[14px]">
                        Due in{" "}
                        {formatDistanceToNow(new Date(project.dueDate), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="italic">No projects found</p>
              )}
            </div>
          </div>

          {/* My Tasks Card */}
          <div className="card bg-base-100 rounded-xl shadow-xs md:col-span-2 lg:col-span-1">
            <div className="card-body">
              <div className="mb-2 flex h-10 items-center justify-between">
                <h2 className="card-title text-base-content text-[18px] font-semibold">
                  My Tasks
                </h2>
                <button
                  className="text-blue mt-3 cursor-pointer p-1 text-[14px] hover:text-indigo-600"
                  onClick={() => navigate("/tasks")}
                >
                  View All
                </button>
              </div>

              {/* Task */}
              {allTasks?.length > 0 ? (
                allTasks?.slice(0, 2).map((task) => (
                  <div
                    key={task._id}
                    className="border-base-300 mb-2 flex items-center gap-3 rounded-lg border-b pb-3"
                  >
                    <div className="body w-full">
                      <div className="header flex justify-between">
                        <h3 className="text-base-content text-[16px] font-medium">
                          {task.title}
                        </h3>
                        <StatusBadge
                          status={task.status}
                          className="flex h-7 w-24 items-center justify-center"
                        />
                      </div>
                      <div className="text-base-content/60 -mt-1 text-[14px]">
                        Due{" "}
                        {formatDistanceToNow(new Date(task.dueDate), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="italic">No tasks yet</div>
              )}
            </div>
          </div>

          {/* Team Activity Card */}
          <div className="card bg-base-100 rounded-xl shadow-xs md:col-span-2 lg:col-span-1">
            <div className="card-body">
              <div className="mb-2 flex h-10 items-center justify-between">
                <h2 className="card-title text-base-content text-[18px] font-semibold">
                  Team Activity
                </h2>
                <button
                  className="text-blue mt-3 cursor-pointer p-1 text-[14px] hover:text-indigo-600"
                  onClick={() => navigate("/notifications")}
                >
                  View All
                </button>
              </div>

              <ul className="space-y-4">
                {filteredNotification.length > 0 ? (
                  filteredNotification?.splice(0, 2).map((notification) => (
                    <li
                      key={notification._id}
                      className="border-base-300 border-b pb-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-8 items-center justify-center rounded-full ${
                            notification.type === "user_joined"
                              ? "bg-blue text-blue"
                              : notification.type === "project_restored"
                                ? "bg-green text-green" // Example color for restored
                                : "text-base-content/60 bg-gray-400" // Default background color
                          }`}
                        >
                          {notification.type === "user_joined" && (
                            <Plus className="size-4" strokeWidth={3} />
                          )}
                          {notification.type === "project_restored" && (
                            <RotateCcw className="size-4" strokeWidth={3} />
                          )}
                          {/* Add more icon conditions as needed */}
                        </div>
                        <div className="text-base-content flex-1">
                          <span className="font-semibold">
                            {notification.message?.split(" ")[0]}
                          </span>{" "}
                          <span>
                            {notification.message
                              ?.split(" ")
                              .slice(1)
                              .join(" ")}
                          </span>
                          <div className="text-base-content/60 text-sm">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              {
                                addSuffix: true,
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="italic">No Notifications to view yet</p>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        <div
          className="bg-base-100 mt-8 rounded-2xl p-4 shadow-xs"
          ref={buttonRef}
        >
          <div className="text-base-content/90 flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <Info className="text-blue size-5" />
              <h3 className="text-blue text-[15px] font-medium">
                Announcements
              </h3>
            </div>
            <RBAC role={role} action="make_announcement">
              <button
                className="cursor-pointer p-1"
                onClick={() => setAddAnnouncement(!addAnnouncement)}
              >
                <Edit className="text-base-content/60 size-4.5" />
              </button>
            </RBAC>
          </div>

          <ul className="mt-4 space-y-4">
            {addAnnouncement && (
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  placeholder="Click to add Announcement"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="border-base-content/30 placeholder:text-base-content/40 w-full border-b pl-2 placeholder:text-sm focus:outline-none"
                />
                <button
                  className="btn btn-sm btn-primary whitespace-nowrap"
                  onClick={handleAddAnnouncement}
                  disabled={!announcementText.trim()}
                >
                  Add
                </button>
              </div>
            )}

            {systemAnnouncement.length > 0
              ? systemAnnouncement.slice(0, 2).map((announcement, index) => (
                  <li
                    key={announcement._id || index}
                    className="rounded-lg bg-blue-50 p-3 py-4 text-sm text-blue-800"
                  >
                    {announcement.message}
                  </li>
                ))
              : !addAnnouncement && (
                  <li className="text-base-content/70 ml-2 text-sm italic">
                    No announcements yet.
                  </li>
                )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Overview;
