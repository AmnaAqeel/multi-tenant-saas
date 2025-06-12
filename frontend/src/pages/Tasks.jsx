import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Plus, Clock, Trash } from "lucide-react";
import { format } from "date-fns";

import { useTaskStore } from "../store/useTaskStore";
import { useAuthStore } from "../store/useAuthStore";

import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

import { Loader } from "../components/Loader";
import MinimalNavbar from "../components/MinimalNavbar";
import CreateTaskModal from "../components/CreateTaskModal";
import { RBAC } from "../utils/rbac";

import { toast } from "sonner";

const Tasks = () => {
  const { authUser } = useAuthStore();
  const role = authUser?.role;
  const {
    fetchAllTasksApi,
    isFetchingTasks,
    allTasks,
    setTasks,
    updateStatusApi,
    deleteTaskApi,
  } = useTaskStore();

  const navigate = useNavigate();
  const [filteredTasks, setFilteredTasks] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState("none");
  const [selectedPriority, setSelectedPriority] = useState("none");
  const [selectedSortBy, setSelectedSortBy] = useState("none");

  const [showCreateModal, setShowCreateModal] = useState(false);

  console.log("allTasks: ", allTasks);

  useEffect(() => {
    console.log("USE EFFECT TRIGGERED");
    if (allTasks.length === 0) {
      console.log("API CALLED FROM TASKS.JSX");
      fetchAllTasksApi();
    }
  }, []);

  useEffect(() => {
    let updated = [...allTasks];

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

    const activeTasks = updated.filter((task) => !task.project?.isArchived);
    console.log("activeTasks: ", activeTasks);

    setFilteredTasks(activeTasks); //update local state
  }, [allTasks, selectedStatus, selectedPriority, selectedSortBy]);

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

  const handleUpdateProjectStatus = async (projectId, taskId, status) => {
    const updatedAll = allTasks.map((task) =>
      task._id === taskId ? { ...task, status } : task,
    );
    setTasks(updatedAll);
    await updateStatusApi(projectId, taskId, status);
  };

  const handleDeleteTask = async (projectId, taskId) => {
    const updatedAll = allTasks.filter((task) => task._id !== taskId);
    setTasks(updatedAll);

    try {
      await deleteTaskApi(projectId, taskId);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  if (isFetchingTasks) return <Loader />;

  return (
    <>
      <MinimalNavbar padding="p-4" />
      <div className="bg-base-200 h-screen space-y-4 px-8 py-4">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <RBAC role={role} action="create_task">
            <button
              className="btn btn-primary btn-sm md:btn-md rounded-lg text-xs font-normal"
              onClick={() => {
                // Close dropdown immediately
                document.activeElement?.blur();
                setShowCreateModal(true);
              }}
            >
              <Plus className="size-4" strokeWidth={3} />
              Create New Task
            </button>
          </RBAC>
        </div>

        {/* Filters */}
        <div className="bg-base-100 flex w-full flex-col items-center justify-between gap-3 rounded-lg p-5 shadow-xs md:flex-row md:items-center">
          {/* sort by */}
          <div className="flex w-full flex-col">
            <label className="label">
              <span className="label-text text-base-content/70 text-sm">
                Sort by:
              </span>
            </label>
            <select
              className="select select-bordered w-full rounded-md text-[14px] focus:outline-none"
              value={selectedSortBy}
              onChange={(e) => setSelectedSortBy(e.target.value)}
            >
              <option value="none">All</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex w-full flex-col">
            <span className="text-base-content/60 text-sm">Priority</span>
            <select
              className="select select-bordered w-full focus-within:outline-none focus:outline-none"
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

          {/* Status */}
          <div className="flex w-full flex-col">
            <span className="text-base-content/60 text-sm">Status</span>
            <select
              className="select select-bordered w-full focus-within:outline-none focus:outline-none"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="none">All Status</option>
              <option value="to-do">To-Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className="card bg-base-100 border-base-200 relative rounded-lg border p-4 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox mt-1"
                    checked={task.status === "completed"}
                    onChange={(e) =>
                      handleUpdateProjectStatus(
                        task.project._id,
                        task._id,
                        e.target.checked ? "completed" : "to-do",
                      )
                    }
                  />
                  <div className="flex-grow">
                    <h3
                      className="cursor-pointer font-medium"
                      onClick={() =>
                        navigate(`/tasks/${task._id}`, {
                          state: { projectId: task.project._id },
                        })
                      }
                    >
                      {task.title}
                    </h3>
                    <p className="text-base-content/70 text-sm">
                      {task.description}
                    </p>
                    <div className="mt-1.5 flex w-full">
                      <p className="text-base-content/60 flex items-center justify-between gap-1 text-sm font-extralight">
                        <Clock className="size-3.5" />
                        Due{" "}
                        {task.dueDate
                          ? format(new Date(task.dueDate), "dd-MM-yyyy")
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex h-full flex-shrink-0 flex-col items-end gap-2 sm:flex-row">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>
                <button
                  className="absolute right-4 bottom-4 cursor-pointer" // Changed top to bottom
                  onClick={() => {
                    // Your delete task logic here, using task._id
                    handleDeleteTask(task.project._id, task._id);
                  }}
                >
                  <Trash className="text-base-content/50 size-4.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="px-2">No Tasks found</div>
          )}
        </div>
      </div>
      {showCreateModal && (
        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
};

export default Tasks;
