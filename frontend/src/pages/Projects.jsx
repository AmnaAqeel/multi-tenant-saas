import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Edit,
  Info,
  Plus,
  Trash,
  EllipsisVertical,
  List,
  Clock,
  Grid3X3,
} from "lucide-react";
import { format } from "date-fns";

import MinimalNavbar from "../components/MinimalNavbar";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import ConfirmModal from "../components/ConfirmModal";
import { Loader } from "../components/Loader";
import { RBAC, disable } from "../utils/rbac";

import CreateProjectModal from "../components/CreateProjectModal";
import EditStatusModal from "../components/EditStatusModal";

import { useProjectStore } from "../store/useProjectStore";
import { useAuthStore } from "../store/useAuthStore";

// Zoro is an admin but he is not seeing both of the projects

const Projects = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const role = authUser?.role;
  //Zustand States
  const {
    allProjects,
    setProjects,
    addProject,
    deleteProject,
    deleteProjectApi,
    createProjectApi,
    fetchProjectsApi,
    isFetchingProject,
  } = useProjectStore();

  //Local states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [layout, setLayout] = useState("grid");
  //setters
  const [filteredProjects, setFilteredProjects] = useState([]);
  //Trackers
  const [selectedStatus, setSelectedStatus] = useState("none");
  const [selectedPriority, setSelectedPriority] = useState("none");
  const [selectedSortBy, setSelectedSortBy] = useState("none");

  const [editingStatusId, setEditingStatusId] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      console.log("Fetching projects...");
      const data = await fetchProjectsApi(); // your API call
      console.log("All projects:", data);
      setProjects(data); // updates global state
    };
    fetchAll();
  }, []);

  const getPriorityValue = (priority) => {
    switch (priority) {
      case "low":
        return 1;
      case "medium":
        return 2;
      case "high":
        return 3;
      default:
        return 0;
    }
  };

  useEffect(() => {
    let updated = [...allProjects];

    if (selectedStatus !== "none") {
      updated = updated.filter((p) => p.status === selectedStatus);
    }

    if (selectedPriority !== "none") {
      updated = updated.filter((p) => p.priority === selectedPriority);
    }

    if (selectedSortBy === "dueDate") {
      updated.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    if (selectedSortBy === "priority") {
      updated.sort(
        (a, b) => getPriorityValue(a.priority) - getPriorityValue(b.priority),
      );
    }

    setFilteredProjects(updated); //update local state
  }, [allProjects, selectedStatus, selectedPriority, selectedSortBy]);

  const handleDeleteClick = (projectId) => {
    setProjectToDelete(projectId);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    try {
      deleteProject(projectToDelete);
      await deleteProjectApi(projectToDelete);
      toast.success("Project deleted");
    } catch (err) {
      toast.error("Delete failed");
      console.error(err);
    }
  };

  const handleUpdateProjectStatus = async (id, status) => {
    const updatedAll = allProjects.map((project) =>
      project._id === id ? { ...project, status } : project,
    );
    setProjects(updatedAll);
  };
  const handleDuplicate = async (project) => {
    const duplicatedProject = {
      title: `${project.title} (Copy)`,
      description: project.description || "",
      priority: project.priority || "medium",
      dueDate: project.dueDate || new Date().toISOString(), // or null
    };
    try {
      const response = await createProjectApi(duplicatedProject); // your existing create API
      if (response) {
        addProject(response.data); // UI-first
      }
    } catch (err) {
      toast.error("Failed to duplicate project.");
      console.error(err);
    }
  };

  if (isFetchingProject) return <Loader />;

  return (
    <>
      <MinimalNavbar padding="p-4 md:p-4" />
      <div className="bg-base-200 h-screen overflow-hidden p-4 sm:px-6.5">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-base-content place-self-start text-xl font-semibold">
            Projects
          </h1>
          <RBAC role={role} action="create_project">
            <button
              className="btn btn-primary btn-sm md:btn-md rounded-lg text-xs font-normal"
              onClick={() => {
                const scrollbarWidth =
                  window.innerWidth - document.documentElement.clientWidth;
                document.documentElement.style.setProperty(
                  "--scrollbar-width",
                  `${scrollbarWidth}px`,
                );
                setShowProjectModal(true);
              }}
            >
              <Plus className="size-4" strokeWidth={3} />
              Create New Project
            </button>
          </RBAC>
        </div>

        {/* Filters */}
        <div className="bg-base-100 mb-6 flex flex-col items-start justify-between gap-4 rounded-lg p-4 sm:gap-4 lg:flex-row lg:items-center">
          <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto">
            {/* Sort by */}
            <div className="form-control flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <label className="label">
                <span className="label-text">Sort by:</span>
              </label>
              <select
                className="select select-bordered w-40 rounded-md text-[14px] focus:outline-none"
                value={selectedSortBy}
                onChange={(e) => setSelectedSortBy(e.target.value)}
              >
                <option value="none">All</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">priority</option>
              </select>
            </div>

            {/* Status  */}
            <div className="form-control flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <label className="label">
                <span className="label-text">Status:</span>
              </label>
              <select
                className="select select-bordered w-40 rounded-md text-[14px] focus:outline-none"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="none">All Status</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Priority  */}
            <div className="form-control flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <label className="label">
                <span className="label-text">Priority:</span>
              </label>
              <select
                className="select select-bordered w-40 rounded-md text-[14px] focus:outline-none"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <option value="none">none</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="hidden justify-end gap-2 place-self-end md:flex">
            <button
              className="border-base-300 hover:bg-base-300 cursor-pointer rounded-md border p-1"
              onClick={() => {
                setLayout(layout === "list" ? "grid" : "list");
              }}
            >
              {layout === "list" ? (
                <List className="size-5" />
              ) : (
                <Grid3X3 className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${layout !== "list" ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-1 lg:grid-cols-1"}`}
        >
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div className="h-full" key={project._id} data={project}>
                <div className="card bg-base-100 border-base-300 flex h-full flex-col justify-between border shadow-sm">
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between">
                      <div
                        className="cursor-pointer"
                        onClick={() => navigate(`/projects/${project._id}`)}
                      >
                        <h2 className="card-title text-base-content text-md">
                          {project.title}
                        </h2>
                        <p className="text-base-content/60 mt-1 flex gap-1 text-sm">
                          <Clock className="size-4" />
                          Due{" "}
                          {project.dueDate
                            ? format(new Date(project.dueDate), "dd-MM-yyyy")
                            : ""}
                        </p>
                      </div>
                      <div className="dropdown dropdown-end z-10">
                        <button
                          tabIndex={0}
                          role="button"
                          className="mt-1 cursor-pointer p-1"
                        >
                          <EllipsisVertical className="size-5" />
                        </button>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu bg-base-100 rounded-box z-1 w-35 p-2 shadow-sm sm:w-50"
                        >
                          <li>
                            <button onClick={() => navigate(`/projects/${project._id}`)}>View Details</button>
                          </li>
                          <RBAC role={role} action="edit_project">
                            <li>
                              <button
                                onClick={() =>
                                  navigate(`/projects/edit/${project._id}`)
                                }
                              >
                                Edit
                              </button>
                            </li>
                          </RBAC>
                          <RBAC role={role} action="create_project">
                            <li>
                              <button onClick={() => handleDuplicate(project)}>
                                Duplicate
                              </button>
                            </li>
                          </RBAC>
                          <RBAC role={role} action="edit_project">
                            <li>
                              <button
                                onClick={() => {
                                  // Close dropdown immediately
                                  document.activeElement?.blur();
                                  setSelectedProject(project);
                                  setShowStatusModal(true);
                                }}
                              >
                                Edit Status
                              </button>
                            </li>
                          </RBAC>
                        </ul>
                      </div>
                    </div>

                    {/* Status and priority*/}
                    <div className="mt-2 flex min-h-[32px] items-center gap-1.5">
                      {editingStatusId === project._id ? (
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          onBlur={() => {
                            // call your update logic here (API or local state)
                            handleUpdateProjectStatus(project._id, newStatus);
                            setEditingStatusId(null); // exit edit mode
                          }}
                          className="select select-sm select-bordered rounded-md text-sm"
                          autoFocus
                        >
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="on-hold">On Hold</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingStatusId(project._id);
                            setNewStatus(project.status);
                          }}
                        >
                          <StatusBadge status={project.status} />
                        </div>
                      )}

                      <PriorityBadge priority={project.priority} />
                    </div>

                    {/* Avatar + Action */}
                    <div className="mt-auto flex min-h-[40px] items-center justify-between">
                      <div className="avatar flex -space-x-2">
                        {project.teamMembers.map((member) => (
                          <div
                            key={member.user._id}
                            className="size-8 rounded-full"
                          >
                            <img
                              src={member.user.profilePicture}
                              alt="user avatar"
                              className="size-8 rounded-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      {/* Dropdown */}
                      <div className="text-base-content/70 flex justify-end gap-4">
                        <button
                          className={`cursor-pointer ${
                            disable({ role, action: "edit_project" })
                              ? " opacity-50"
                              : ""
                          }`}
                          onClick={() =>
                            navigate(`/projects/edit/${project._id}`)
                          }
                          disabled={disable({ role, action: "edit_project" })}
                        >
                          <Edit className="size-5" strokeWidth={2} />
                        </button>
                        <div
                          className="tooltip tooltip-info mt-1.5"
                          data-set="tooltip"
                          data-tip={
                            project.description?.length > 85
                              ? project.description.slice(0, 85).trim() + "..."
                              : project.description
                          }
                        >
                          <button className="cursor-pointer">
                            <Info className="size-5" strokeWidth={2} />
                          </button>
                        </div>
                        <button
                          className={`cursor-pointer ${
                            disable({ role, action: "edit_project" })
                              ? " opacity-50"
                              : ""
                          }`}
                          onClick={() => handleDeleteClick(project._id)}
                          disabled={disable({ role, action: "edit_project" })}

                        >
                          <Trash className="size-5" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="px-2">Not part of any project yet</p>
          )}
        </div>
        {showStatusModal && selectedProject && (
          <EditStatusModal
            isOpen={showStatusModal}
            onClose={() => setShowStatusModal(false)}
            currentStatus={selectedProject.status}
            id={selectedProject._id}
            handleUpdateProjectStatus={handleUpdateProjectStatus}
          />
        )}
      </div>
      <CreateProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
      />
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Project?"
        description="Are you sure you want to delete this project? All tasks under this project will also be permanently removed."
        confirmText="Delete"
      />
    </>
  );
};

export default Projects;
