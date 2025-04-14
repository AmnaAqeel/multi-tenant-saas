import { EllipsisVertical, CircleCheck } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import {Loader} from "../components/Loader";
import { useNotificationStore } from "../store/useNotificationStore";


//  Overall Concept:
// We have:
// notification → all notifications (from your Zustand store)
// filteredNotification → the currently visible ones based on filter (e.g. unread, read, or all)

// You show them as:
// recentNotifications (less than a day old, etc.)
// olderNotifications (more than a day old)

const Notifications = () => {
  const {
    notification,
    setFilteredNotification,
    filteredNotification,
    setNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading,
    setHasNewNotfication
  } = useNotificationStore();
  const [selectedFilter, setSelectedFilter] = useState("all");

  
  useEffect(() => {
    // User has now seen the messages
    setHasNewNotfication(false);
  }, [setHasNewNotfication]);
  
  if(loading) return <Loader />

  const markSingleAsRead = (id) => {
    const updated = notification.map((n) =>
      n._id === id ? { ...n, read: true } : n
    );
  
    setNotifications(updated);         // Update main list
    // setSelectedFilter("all"); // Just before markSingleAsRead runs
    reapplyFilter(updated);            // Re-apply filter to update UI view
    markAsRead(id);                    // API call to update DB
  };

  const handleMarkAllRead = () => {
    // Update master notification list
    const updated = notification.map((n) =>
      filteredNotification.some((f) => f._id === n._id)
        ? { ...n, read: true }
        : n
    );
  
    setNotifications(updated); // master updated
    reapplyFilter(updated);    // filtered updated based on selected filter
    markAllAsRead();
  };
  
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);

    let filtered = [];
    if (filter === "unread") {
      filtered = notification.filter((n) => !n.read);
    } else if (filter === "read") {
      filtered = notification.filter((n) => n.read);
    } else {
      filtered = notification;
    }

    setFilteredNotification(filtered);
  };

  const reapplyFilter = (data) => {
    let filtered = data;  // Default to unfiltered
  
    if (selectedFilter === "unread") {
      filtered = data.filter((n) => !n.read);  // Show only unread
    } else if (selectedFilter === "read") {
      filtered = data.filter((n) => n.read);  // Show only read
    }
  
    setFilteredNotification(filtered);  // Set the filtered data
  };

  const handleRemoveNotification = (id) => {
    const updated = notification.filter((n) => n._id !== id);
    setNotifications(updated);
    reapplyFilter(updated);
    deleteNotification(id);
  };
  

  const daysAgo = 5; //  change this to 7 or whatever
  const timeThreshold = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  const recentNotifications = filteredNotification.filter(
    (notif) => new Date(notif.createdAt) >= timeThreshold,
  );

  const olderNotifications = filteredNotification.filter(
    (notif) => new Date(notif.createdAt) < timeThreshold,
  );

  return (
    <>
      {/* <!-- navbar --> */}
      <div className="navbar border-base-content/10 h-12 border-b">
        {/* <!-- Header --> */}
        <div className="flex w-full items-center justify-between p-5 md:p-20">
          <div className="flex items-center">
            <h3 className="font-semibold ml-5 md:ml-0">Dashboard</h3>
          </div>
          <div className="flex items-center">
            <div className="theme-toggle p-2 hover:scale-120 hover:transform">
              <ThemeToggle
                className="text-base-content/70 md:text-base-content/50"
                className2="size-7 md:size-6"
              />
            </div>
            <div className="size-8 rounded-full bg-black md:size-7.5"></div>
          </div>
        </div>
      </div>
      <div className="body bg-base-200 w-full min-h-full">
        <div className="container mx-auto pl-5 pr-5 md:pr-20 md:pl-20">
          <div className="mb-4 flex justify-between">
            <h2 className="text-base-content pt-5 text-xl font-semibold">
              Notifications
            </h2>
            <div className="flex flex-col items-start justify-between mt-7 md:mt-0 gap-1 md:gap-4 pt-5 md:flex-row md:items-center">
              {/* Mark all as read button */}
              <button
                className="btn text-primary flex transform items-center justify-center border-none text-[16px] shadow-none transition duration-200 hover:scale-103 hover:bg-transparent hover:shadow-none"
                onClick={handleMarkAllRead}
              >
                <CircleCheck className="mb-0.5 size-4.5" />{" "}
                <h1 className="font-medium">Mark all as read</h1>
              </button>

              {/* Filter dropdown */}
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn bg-base-100 border-base-content/15 hover:bg-base-300 text-base-content rounded-lg border text-[16px] font-normal shadow-none hover:shadow-none"
                >
                  {selectedFilter === "all"
                    ? "All notifications"
                    : selectedFilter === "unread"
                      ? "Unread"
                      : "Read"}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-base-content/80 ml-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <ul
                  className="dropdown-content menu bg-base-100 rounded-box z-10 mt-2 w-52 p-2 shadow-lg"
                  tabIndex={0}
                >
                  <li>
                    <a
                      className={`text-base-content ${selectedFilter === "all" ? "bg-base-300" : ""}`}
                      onClick={() => {
                        handleFilterChange("all");
                      }}
                      aria-current={selectedFilter === "all" ? "true" : "false"}
                    >
                      All notifications
                    </a>
                  </li>
                  <li>
                    <a
                      className={`text-base-content ${selectedFilter === "unread" ? "bg-base-300" : ""}`}
                      onClick={() => {
                        handleFilterChange("unread");
                      }}
                      aria-current={
                        selectedFilter === "unread" ? "true" : "false"
                      }
                    >
                      Unread
                    </a>
                  </li>
                  <li>
                    <a
                      className={`text-base-content ${selectedFilter === "read" ? "bg-base-300" : ""}`}
                      onClick={() => handleFilterChange("read")}
                      aria-current={
                        selectedFilter === "read" ? "true" : "false"
                      }
                    >
                      Read
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="h-full w-full rounded-2xl shadow-sm overflow-hidden">
            {/* <!-- UNREAD Section --> */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base-content/50 text-md m-4 font-bold">
                  RECENT
                </h3>
              </div>

              {/* <!-- Notification Items --> */}
              <div className="flex flex-col">
                {/* <!-- Notification heading --> */}
                {recentNotifications.length ? (
                  recentNotifications.map((each) => (
                    <div
                      key={each._id}
                      className={`card ${each.read ? "bg-base-100" : "bg-primary/7"} rounded-none transition-colors`}
                    >
                      <div className="card-body border-base-content/5 border-b p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <div className="bg-primary md:size-9 sm:size-6 rounded-full">
                              <img
                                src={each.userId.profilePicture}
                                className="h-full w-full rounded-full sm:size-6 md:size-9"
                              />
                            </div>
                            <div>
                              <h4 className="text-base-content">
                                <span className="font-bold">
                                  {each.message.split(" ")[0]}
                                </span>{" "}
                                <span>
                                  {each.message.split(" ").slice(1).join(" ")}
                                </span>
                              </h4>

                              <p className="text-base-content/40 text-sm">
                                {formatDistanceToNow(new Date(each.createdAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="dropdown dropdown-bottom dropdown-end">
                            <div
                              tabIndex={0}
                              role="button"
                              className="text-base-content"
                            >
                              <EllipsisVertical className="text-base-content/30" />
                            </div>
                            <ul
                              tabIndex={0}
                              className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
                            >
                              <li>
                                <a
                                  onClick={() =>
                                    handleRemoveNotification(each._id)
                                  }
                                >
                                  Remove
                                </a>
                              </li>

                              <li>
                                <a onClick={() => {markSingleAsRead(each._id)}}>
                                  Mark as read
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card bg-base-100 hover:bg-primary/8 rounded-none transition-colors">
                    <div className="card-body border-base-content/5 border-b p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-base-content text-[15px]">
                          No Older Notifications
                        </h2>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* <!-- EARLIER Section --> */}
            <div>
              <h3 className="text-base-content/50 text-md m-4 font-bold">
                EARLIER
              </h3>

              <div className="flex flex-col">
                {/* <!-- Earlier Items --> */}
                {olderNotifications.length ? (
                  olderNotifications.map((each) => (
                    <div
                      key={each._id}
                      className={`card ${each.read ? "bg-base-100" : "bg-primary/7"} rounded-none transition-colors`}
                    >
                      <div className="card-body border-base-content/5 border-b p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <div className="bg-primary md:size-9 rounded-full sm:size-6 ">
                              <img
                                src={each.userId.profilePicture}
                                className="h-full w-full rounded-full sm:size-6 md:size-9"
                              />
                            </div>
                            <div>
                              <h4 className="text-base-content">
                                <span className="font-bold">
                                  {each.message.split(" ")[0]}
                                </span>{" "}
                                <span>
                                  {each.message.split(" ").slice(1).join(" ")}
                                </span>
                              </h4>

                              <p className="text-base-content/40 text-sm">
                                {formatDistanceToNow(new Date(each.createdAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="dropdown dropdown-bottom dropdown-end">
                            <div
                              tabIndex={0}
                              role="button"
                              className="text-base-content"
                            >
                              <EllipsisVertical className="text-base-content/30" />
                            </div>
                            <ul
                              tabIndex={0}
                              className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
                            >
                               <li>
                                <a
                                  onClick={() =>
                                    handleRemoveNotification(each._id)
                                  }
                                >
                                  Remove
                                </a>
                              </li>
                              <li>
                              <a onClick={() => {markSingleAsRead(each._id)}}>
                                  Mark as read
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card bg-base-100 hover:bg-primary/8 rounded-none transition-colors">
                    <div className="card-body border-base-content/5 border-b p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-base-content text-[15px]">
                          No Older Notifications
                        </h2>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
