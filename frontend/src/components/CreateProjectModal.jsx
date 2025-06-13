import { useState } from "react";

import { useProjectStore } from "../store/useProjectStore";
import log from "../utils/logger";

import { toast } from "sonner";
import { ButtonLoader } from "./Loader";


const CreateProjectModal = ({ isOpen, onClose }) => {
  const { createProjectApi, isCreatingProject, addProject } = useProjectStore();

  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    priority: "",
    status: "",
    dueDate: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectData.title) {
      toast.error("Project title is required");
      return;
    }

    const response = await createProjectApi(projectData);
    log("response", response);

    if (response) {
      addProject(response.data);
      onClose();
      setProjectData({
        title: "",
        description: "",
        priority: "",
        status: "",
        dueDate: "",
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
        <h3 className="mb-4 text-xl font-bold">Create Project</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">
              <span className="label-text">Project Title *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full focus:outline-none"
              placeholder="e.g. AI Powered Collaboration Tool"
              value={projectData.title}
              onChange={(e) =>
                setProjectData({ ...projectData, title: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full focus:outline-none"
              placeholder="e.g. A project focused on building an AI-driven tool ..."
              value={projectData.description}
              onChange={(e) =>
                setProjectData({ ...projectData, description: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Priority</span>
            </label>
            <select
              className="select select-bordered w-full focus:outline-none"
              value={projectData.priority}
              onChange={(e) =>
                setProjectData({ ...projectData, priority: e.target.value })
              }
            >
              <option disabled value="">
                Select Priority
              </option>
              {["low", "medium", "high", "urgent"].map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text text-base font-semibold">
                Project Status
              </span>
            </label>
            <select
              className="select select-bordered w-full text-sm capitalize focus:outline-none"
              value={projectData.status}
              onChange={(e) =>
                setProjectData({ ...projectData, status: e.target.value })
              }
            >
              <option disabled value="">
                Select Status
              </option>
              {[
                { label: "Not Started", value: "not-started" },
                { label: "On Hold", value: "on-hold" },
                { label: "In Progress", value: "in-progress" },
                { label: "Cancelled", value: "cancelled" },
                { label: "Completed", value: "completed" },
              ].map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Due Date</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full focus-within:outline-none"
              value={projectData.dueDate}
              onChange={(e) =>
                setProjectData({ ...projectData, dueDate: e.target.value })
              }
              required
            />
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
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreatingProject}
            >
              {isCreatingProject ? (
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

export default CreateProjectModal;
