import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { toast } from "sonner";
import {
  Activity,
  Check,
  Ellipsis,
  PenSquare,
  Plus,
  Settings,
  Bell,
  RotateCcw,
  MessageSquareText,
  UserPlus,
  ClipboardCheck,
} from "lucide-react";
import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns";

import { useProjectStore } from "../store/useProjectStore";
import { useTaskStore } from "../store/useTaskStore";
import { useCompanyStore } from "../store/useCompanyStore";

import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import MinimalNavbar from "../components/MinimalNavbar";

import CreateTaskModal from "../components/CreateTaskModal";
import AddTeamMemberModal from "../components/AddTeamMemberModal";
import { useNotificationStore } from "../store/useNotificationStore";
import { useAuthStore } from "../store/useAuthStore";
import { RBAC } from "../utils/rbac";

const ProjectDetailPage = () => {
  const { id } = useParams(); // Dynamic ID from URL

  const {
    getProjectByIdApi,
    updateStatusApi: updateProjectStatus,
    restoreProjectApi,
    removeTeamMembersApi,
  } = useProjectStore();
  const {
    fetchProjectTasksApi,
    updateStatusApi,
    allTasks,
    fetchAllTasksApi,
    deleteTaskApi,
  } = useTaskStore();

  const { fetchNotifications } = useNotificationStore();
  const { fetchCompanyUsers, companyUsers } = useCompanyStore();
  const { authUser } = useAuthStore();
  const role = authUser?.role;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const [projectData, setProjectData] = useState([]);
  const [projectTasks, setProjectTasks] = useState([]);
  const [Notifications, setNotifications] = useState([]);

  const [editTitle, setEditTitle] = useState(false);

  // Project Data
  useEffect(() => {
    const fetchProjectAndRelatedData = async () => {
      console.log("Entered fetchProjectAndRelatedData");
      const project = await getProjectByIdApi(id); // Assuming this returns project
      console.log("project: ", project);
      setProjectData(project);
      fetchProjectTasksApi(id);
    };

    fetchProjectAndRelatedData();
  }, [id]);

  //Company Users
  useEffect(() => {
    if (projectData.companyId) {
      fetchCompanyUsers(projectData.companyId);
    }
  }, [projectData.companyId]);

  //Tasks
  useEffect(() => {
    console.log("API CALLED FROM PROJECTPAGE.JSX");
    fetchAllTasksApi();
  }, []);

  //  filter tasks separately
  useEffect(() => {
    console.log("all Tasks: ", allTasks);
    const filteredTasks = allTasks.filter((task) => task.project?._id === id);
    setProjectTasks(filteredTasks);
  }, [allTasks, id]); // ← only when allTasks or project ID changes

  //Notifications
  useEffect(() => {
    if (!id) return; // wait until the id is available

    const fetchData = async () => {
      try {
        console.log("Entered fetch notifications with projectId:", id);
        const response = await fetchNotifications(id);
        setNotifications(response || []); // default to empty if response is falsy
      } catch (err) {
        console.error("Error in fetchData:", err);
      }
    };

    fetchData();
  }, [id]);

  const notificationIconMap = {
    project_assigned: ClipboardCheck,
    project_status_changed: Activity,
    project_restored: RotateCcw,
    new_comment: MessageSquareText,
    task_assigned: UserPlus,
  };

  const NotificationItem = ({ type }) => {
    const Icon = notificationIconMap[type] || Bell;
    return (
      <span className="text-primary">
        <Icon className="size-5" strokeWidth={3} />
      </span>
    );
  };

  const refetchProject = async () => {
    try {
      const data = await getProjectByIdApi(id);
      setProjectData(data);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project");
    }
  };

  const handleStatusUpdate = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "completed" ? "to-do" : "completed";
    const projectId = id; // or get it from props/state depending on your structure

    try {
      await updateStatusApi(projectId, taskId, newStatus);
      await fetchProjectTasksApi(projectId); // refresh tasks after status update
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      setProjectData((prev) => ({
        ...prev,
        teamMembers: prev.teamMembers.filter(
          (member) => member.userId !== userId,
        ),
      }));
      await removeTeamMembersApi(projectData._id, userId);
      await refetchProject();
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error("Failed to remove team member");
    }
  };

  const handleRemoveTask = async (taskId) => {
    console.log("Removing single Task");
    try {
      setProjectTasks(projectTasks.filter((task) => task._id !== taskId));

      await deleteTaskApi(projectData._id, taskId);
    } catch (error) {
      console.error("Error removing task:", error);
      toast.error("Failed to remove task");
    }
  };
  const handleProjectArchive = async () => {
    try {
      const newStatus = "archived";
      setProjectData((prev) => ({
        ...prev,
        status: newStatus,
        isArchived: true,
        archivedBy: authUser._id,
      }));
      await updateProjectStatus(projectData._id, newStatus);
      await refetchProject();
    } catch (error) {
      console.error("Error archiving project:", error);
      toast.error("Failed to archive project");
    }
  };
  const handleRestoreProject = async (id) => {
    try {
      setProjectData((prev) => ({
        ...prev,
        status: "on-hold",
        isArchived: false,
        archivedBy: null,
      }));
      await restoreProjectApi(projectData._id);
      await refetchProject();
      toast.success("Project restored successfully");
    } catch (error) {
      console.error("Error restoring project:", error);
      toast.error("Failed to restore project");
    }
  };

  console.log("project Data:", projectData);
  return (
    <>
      <MinimalNavbar padding={"p-5 md:p-5"} />
      <div className="bg-base-200 space-y-6 px-10 py-4 sm:p-5">
        {/* Header and Description */}
        <div className="bg-base-100 flex flex-col flex-wrap items-start justify-between gap-4 rounded-xl p-5 shadow-xs">
          <div className="flex w-full flex-col justify-between sm:flex-row">
            <div className="w-md">
              {editTitle ? (
                <div className="flex">
                  <input
                    type="text"
                    className="border-base-300 max-w-md border-b px-2 py-1 shadow-none focus:outline-none sm:w-full"
                    value={projectData.title}
                    onChange={(e) =>
                      setProjectData({ ...projectData, title: e.target.value })
                    }
                  />
                  <button
                    className="translate-y-3 transform cursor-pointer p-1"
                    onClick={() => {
                      setEditTitle(false);
                      setProjectData({
                        ...projectData,
                        title: projectData.title,
                      });
                    }}
                  >
                <RBAC role={role} action="edit_project">
                    <Check
                      strokeWidth={3}
                      className="transform -translate-y-4 text-base-content/50 size-5"
                    />
                    </RBAC>
                  </button>
                </div>
              ) : (
                <h1 className="text-xl font-bold relative">
                  {projectData.title}{" "}
                  <button
                    className="absolute transform cursor-pointer p-1"
                    onClick={() => setEditTitle(true)}
                  >
                    <PenSquare className="text-base-content/40 size-4" />
                  </button>
                </h1>
              )}
              <div className="mt-5 flex gap-2">
                <StatusBadge status={projectData.status} />
                <PriorityBadge priority={projectData.priority} />
              </div>
            </div>
            {/* Archive button */}
            <RBAC role={role} action="archive_project">
              <div>
                {projectData.status === "archived" ? (
                  <button
                    className="btn Frder-base-300 btn-md mt-4 w-auto text-[14px] font-extralight hover:bg-none sm:mt-0"
                    onClick={() => handleRestoreProject(projectData._id)}
                  >
                    <RotateCcw
                      className="text-base-content size-4"
                      strokeWidth={1}
                    />{" "}
                    Restore Project
                  </button>
                ) : (
                  <button
                    className="btn bg-base-100 hover:border-base-300 btn-md mt-4 w-auto text-[14px] font-extralight hover:bg-none sm:mt-0"
                    onClick={() => handleProjectArchive()}
                  >
                    <Settings
                      className="text-base-content size-4"
                      strokeWidth={1}
                    />{" "}
                    Archive Project
                  </button>
                )}
              </div>
            </RBAC>
          </div>
          {/* Description */}
          <div className="bg-base-200 border-base-300 w-full rounded-xl border p-4">
            {projectData.description}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tasks */}
          <div className="bg-base-100 space-y-4 rounded-xl p-5 shadow-xs lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tasks</h2>
              <RBAC role={role} action="create_task">
                <button
                  className="btn btn-primary btn-sm rounded-md text-[14px] font-extralight text-white"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="size-4" /> Add Task
                </button>
              </RBAC>
            </div>

            <div className="space-y-3">
              {projectTasks.length ? (
                projectTasks.map((task) => (
                  <div
                    key={task._id}
                    className="card bg-base-100 p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="checkbox mt-1"
                        checked={task.status === "completed"}
                        onChange={() =>
                          handleStatusUpdate(task._id, task.status)
                        }
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="text-base-content/70 text-sm">
                          {task.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-base-content/60">
                            Due{" "}
                            {task.dueDate
                              ? format(new Date(task.dueDate), "dd-MM-yyyy")
                              : ""}
                          </span>
                          <div className="flex -space-x-2">
                            {task.assignedTo.map((user) => (
                              <img
                                key={user.userId._id}
                                src={user.userId.profilePicture}
                                className="border-base-100 h-6 w-6 rounded-full border-2"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="dropdown dropdown-end">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-xs btn-ghost"
                        >
                          <Ellipsis className="size-4" />
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu bg-base-100 rounded-box z-1 w-26 p-2 shadow-sm"
                        >
                          <li>
                            <button onClick={() => handleRemoveTask(task._id)}>
                              Remove
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm italic">No Tasks assigned yet</p>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Team Members */}
            <div className="bg-base-100 rounded-xl p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">Team Members</h2>
                <RBAC role={role} action="add_project_members">
                  <button
                    className="btn btn-xs btn-ghost"
                    onClick={() => setShowAddMemberModal(true)}
                  >
                    <Plus className="size-4" />
                  </button>
                </RBAC>
              </div>
              <ul className="space-y-3">
                {projectData?.teamMembers?.length ? (
                  projectData.teamMembers.map((member) => (
                    <li
                      key={member.userId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={member.profilePicture}
                          className="h-8 w-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-base-content/60 text-xs">
                            {member.role}
                          </p>
                        </div>
                      </div>
                      <div className="dropdown dropdown-end">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-xs btn-ghost"
                        >
                          <Ellipsis className="size-4" />
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu bg-base-100 rounded-box z-1 w-26 p-2 shadow-sm"
                        >
                          <li>
                            <button
                              onClick={() => handleRemoveMember(member.userId)}
                            >
                              Remove
                            </button>
                          </li>
                        </ul>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-sm italic">No Team Members</p>
                )}
              </ul>
            </div>

            {/* Activity */}
            <div className="bg-base-100 rounded-xl p-4 shadow-sm">
              <h2 className="mb-2 font-semibold">Activity</h2>
              <ul className="space-y-3 text-sm">
                {Notifications.length > 0 ? (
                  Notifications.slice(0, 5).map((notf) => (
                    <li key={notf._id} className="flex items-start gap-3">
                      {/* Render NotificationItem as a component */}
                      <NotificationItem type={notf.type} />

                      <div>
                        <p>{notf.message}</p>
                        <p className="text-base-content/50 text-xs">
                          {formatDistanceToNow(new Date(notf.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="italic">No recent activity</p>
                )}
              </ul>
            </div>
          </div>
        </div>
        {showCreateModal && (
          <CreateTaskModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            fetchAllTasksApi={fetchAllTasksApi}
            preselectedProjectId={id}
          />
        )}
        <AddTeamMemberModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          companyUsers={companyUsers}
          projectId={id}
          projectTeamMembers={projectData.teamMembers}
          onMemberAdded={refetchProject}
        />
      </div>
    </>
  );
};

export default ProjectDetailPage;
