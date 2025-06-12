import { useEffect, useState } from "react";

import { useTaskStore } from "../store/useTaskStore";
import { useProjectStore } from "../store/useProjectStore";

import { ButtonLoader } from "../components/Loader";

import { toast } from "sonner";

export default function CreateTaskModal({
  isOpen,
  onClose,
  fetchAllTasksApi,
  preselectedProjectId,
}) {
  const { createTaskApi, isCreatingTask, addTask } = useTaskStore();
  const { allProjects, setProjects, getUsersByProjectApi, fetchProjectsApi } =
    useProjectStore();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    projectId: preselectedProjectId || "",
    dueDate: "",
    assignedTo: [],
    status: "",
  });

  const [projectUsers, setProjectUsers] = useState([]);

  useEffect(() => {
    if (preselectedProjectId) {
      const fetchUsers = async () => {
        try {
          const users = await getUsersByProjectApi(preselectedProjectId);
          setProjectUsers(users || []);
        } catch (err) {
          toast.error("Failed to fetch users");
        }
      };
      fetchUsers();
    }
  }, [preselectedProjectId]);
  

  useEffect(() => {
    const fetchAll = async () => {
      console.log("Fetching projects...");
      const data = await fetchProjectsApi(); // your API call
      console.log("All projects:", data);
      setProjects(data); // updates global state
    };
    fetchAll();
  }, []);

  useEffect(() => {
    console.log("manually useEffect ran")
    if (formData.projectId && !preselectedProjectId) {
      const fetchUsers = async () => {
        try {
          const users = await getUsersByProjectApi(formData.projectId);
          setProjectUsers(users || []);
        } catch (err) {
          toast.error("Failed to fetch users");
        }
      };
      fetchUsers();
    }
  }, [formData.projectId, preselectedProjectId]);  


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignChange = (e) => {
    const selectedUserId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(selectedUserId)
        ? prev.assignedTo.filter((id) => id !== selectedUserId)
        : [...prev.assignedTo, selectedUserId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.projectId) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority || "medium",
      status: formData.status || "to-do",
      dueDate: formData.dueDate,
      assignedTo: formData.assignedTo?.map((userId) => ({ userId })),
    };  

    try {
      const response = await createTaskApi(formData.projectId, payload);
      if (response) {
        fetchAllTasksApi();
      }

      onClose();
    } catch (err) {
      toast.error("Task creation failed");
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box scrollbar-thin scrollbar-thumb-base-content/20 max-h-[95vh] w-full max-w-3xl overflow-y-auto">
        <h3 className="mb-4 text-2xl font-semibold">Create New Task</h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Task Title */}
          <div>
            <label className="label font-medium">Task Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input input-bordered w-full focus-within:outline-none focus:outline-none"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full focus-within:outline-none focus:outline-none"
              placeholder="Describe the task..."
              rows={4}
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label font-medium">Priority</label>
              <select
                name="priority"
                className="select select-bordered w-full focus-within:outline-none focus:outline-none"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* If you want to add status in the future, put it here */}
            <div>
              <label className="label font-medium">Status</label>
              <select
                name="status"
                className="select select-bordered w-full focus-within:outline-none focus:outline-none"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* dueDate */}
          <div>
            <label className="label font-medium">Due Date</label>
            <input
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              className="input input-bordered w-full focus-within:outline-none focus:outline-none"
              required
            />
          </div>

          {/* Project Selection */}
          <div>
            <label className="label font-medium">Project</label>
            <select
              name="projectId"
              className="select select-bordered w-full focus-within:outline-none focus:outline-none"
              value={formData.projectId}
              onChange={handleChange}
              required
              disabled={!!preselectedProjectId} // disable if project is already selected via props
            >
              <option value="">Select a project</option>
              {allProjects?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Assign To */}
          <div>
            <label className="label mb-2 font-medium">Assign To</label>
            {projectUsers.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No users found for this project
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {projectUsers.length > 0 ? (
                  projectUsers.map((member) => (
                    <label
                      key={member.user._id}
                      className="bg-base-200 flex items-center space-x-4 rounded-lg p-3 shadow-sm transition hover:shadow-md"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        value={member.user._id}
                        onChange={handleAssignChange}
                        checked={formData.assignedTo.includes(member.user._id)}
                      />
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            member.user.profilePicture || "/default-avatar.png"
                          }
                          alt={member.user.fullName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{member.user.fullName}</p>
                          <p className="text-sm text-gray-500">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No users found for this project.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="submit"
              className={`btn btn-primary ${isCreatingTask ? "loading" : ""}`}
              disabled={isCreatingTask}
            >
              {isCreatingTask ? <ButtonLoader /> : "Create Task"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
