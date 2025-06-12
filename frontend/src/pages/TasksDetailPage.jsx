import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { useTaskStore } from "../store/useTaskStore";
import { useAuthStore } from "../store/useAuthStore";

import { Loader } from "../components/Loader";
import MinimalNavbar from "../components/MinimalNavbar";
import AssignUserModal from "../components/AssignUserModal";

import { toast } from "sonner";
import {
  Calendar,
  Plus,
  PenSquare,
  Trash,
  Check,
  Ellipsis,
} from "lucide-react";
import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns";

import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";

const TasksDetailPage = () => {
  const { taskId } = useParams();
  const location = useLocation();
  const projectId = location.state?.projectId;

  const navigate = useNavigate();

  const { authUser } = useAuthStore();

  const {
    getTaskByIdApi,
    isGettingTaskById,
    updateStatusApi,
    updateTaskApi,
    createSubTaskApi,
    checkSubTaskApi,
    deleteSubTaskApi,
    addCommentApi,
    deleteCommentApi,
  } = useTaskStore();

  const [taskData, setTaskData] = useState({});
  const [orignalData, setOrignalData] = useState(false);

  const [edit, setEdit] = useState();

  const [subTask, setSubTask] = useState("");
  const [subTaskTitle, setSubTaskTitle] = useState("");

  const [comment, setComment] = useState("");

  const [showAssignModal, setShowAssignModal] = useState(false);

  console.log("taskData:", taskData);
  console.log("taskData.assignedTo:", taskData.assignedTo);

  useEffect(() => {
    if (!projectId || !taskId) navigate("/tasks");

    // make your API call like:
    refetchTask(projectId, taskId);
  }, [projectId, taskId]);

  const refetchTask = async () => {
    try {
      const data = await getTaskByIdApi(projectId, taskId);
      setTaskData(data);
      setOrignalData(data);
    } catch (error) {
      console.error("Error fetching task:", error);
      toast.error("Failed to load task");
    }
  };
  //   try {
  //     const data = await fetchSubTasksApi(taskData.project, taskData._id);
  //     setSubTaskData(data);
  //   } catch (error) {
  //     console.error("Error fetching task:", error);
  //     toast.error("Failed to load task");
  //   }
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = async (e) => {
    const { value } = e.target;
    setTaskData((prev) => ({ ...prev, status: value }));

    try {
      await updateStatusApi(taskData.project, taskData._id, value);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const handleUpdate = async () => {
    let updated = {};
    if (taskData.title !== orignalData.title) updated.title = taskData.title;

    if (taskData.description !== orignalData.description)
      updated.description = taskData.description;

    if (taskData.priority !== orignalData.priority)
      updated.priority = taskData.priority;

    if (Object.keys(updated).length === 0) return;

    await updateTaskApi(taskData.project, taskData._id, taskData.status);
  };

  const handleAddSubTask = async () => {
    if (!subTaskTitle.trim()) return;

    try {
      const newSubTask = await createSubTaskApi(
        taskData.project,
        taskData._id,
        {
          title: subTaskTitle,
        },
      );

      setTaskData((prev) => ({
        ...prev,
        subtasks: [...prev.subtasks, newSubTask], // immutably add it
      }));

      setSubTaskTitle(""); // clear input
    } catch (err) {
      toast.error("Failed to add subtask");
    }
  };

  const handleCheckSubTask = async (subTaskId) => {
    try {
      // Find current subtask
      const currentSubtask = taskData.subtasks.find(
        (sub) => sub._id === subTaskId,
      );

      // Determine the new status to send
      const newStatus =
        currentSubtask.status === "completed" ? "to-do" : "completed";

      // Send to API
      const updatedSubTask = await checkSubTaskApi(
        taskData.project,
        taskData._id,
        subTaskId,
        {
          status: newStatus,
        },
      );

      console.log("Updated subtask status from API:", updatedSubTask.status);

      // Update state
      setTaskData((prev) => ({
        ...prev,
        subtasks: prev.subtasks.map((sub) =>
          sub._id === updatedSubTask._id ? updatedSubTask : sub,
        ),
      }));
      console.log("Updated local state:", taskData.subtasks);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update subtask status");
    }
  };

  const handleDeleteSubTask = async (subTaskId) => {
    try {
      await deleteSubTaskApi(taskData.project, taskData._id, subTaskId);

      // Update state to reflect deletion
      setTaskData((prev) => ({
        ...prev,
        subtasks: prev.subtasks.filter((sub) => sub._id !== subTaskId),
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete subtask");
    }
  };

  const handleAddComment = async () => {
    try {
      const newComment = await addCommentApi(
        taskData.project,
        taskData._id,
        comment,
      );
      console.log("newComment: ", newComment)

      setTaskData((prev) => ({
        ...prev,
        comments: [...prev.comments, newComment],
      }));

      setComment(""); // clear input
    } catch (error) {
      console.error(error);
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await deleteCommentApi(
        taskData.project,
        taskData._id,
        commentId,
      );
      if (response) {
        setTaskData((prev) => ({
          ...prev,
          comments: prev.comments.filter((c) => c._id !== commentId),
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete subtask");
    }
  };


  if (isGettingTaskById) return <Loader />;
  return (
    <>
      <MinimalNavbar padding="p-5" />
      <div className="bg-base-200 space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="bg-base-100 space-y-3 rounded-lg p-5">
          {/* Title */}
          <div className="flex flex-wrap items-start justify-between">
            {edit ? (
              <div className="flex w-full items-center justify-between">
                <input
                  name="title"
                  type="text"
                  className="border-base-300 w-md border-b px-2 py-1 shadow-none focus:outline-none"
                  value={taskData.title}
                  onChange={handleChange}
                />
                <button
                  className="cursor-pointer p-1"
                  onClick={() => {
                    setEdit(false);
                    handleUpdate();
                  }}
                >
                  <Check
                    strokeWidth={3}
                    className="text-base-content/70 size-4"
                  />
                </button>
              </div>
            ) : (
              <div className="flex w-full items-center justify-between">
                <h1 className="text-lg font-bold">{taskData.title} </h1>
                <button
                  className="cursor-pointer p-1"
                  onClick={() => setEdit(true)}
                >
                  <PenSquare className="text-base-content/40 size-4" />
                </button>
              </div>
            )}
          </div>
          {/* Description */}
          <div className="card">
            {edit ? (
              <div className="flex w-full">
                <textarea
                  name="description"
                  className="textarea border-base-300 w-full px-2 py-1 shadow-none focus:outline-none"
                  value={taskData.description}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <p className="text-base-content/80 text-sm">
                {taskData.description}{" "}
              </p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-4 lg:col-span-2">
            {/* Subtasks */}
            <div className="card bg-base-100 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-md font-bold">Subtasks</h2>
                <button
                  className="text-primary flex cursor-pointer items-center gap-1 space-x-2 p-2"
                  onClick={() => setSubTask(true)}
                >
                  <Plus className="size-4.5" strokeWidth={3} /> Add Subtask
                </button>
              </div>
              {subTask && (
                <div className="mb-4 flex items-center space-x-2">
                  <input
                    type="text"
                    value={subTaskTitle}
                    onChange={(e) => setSubTaskTitle(e.target.value)}
                    className="border-base-300 text-base-content/85 placeholder:text-base-content/40 w-full border-b px-6 py-1 text-[15px] focus:outline-none"
                    placeholder="Add Title"
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      handleAddSubTask();
                      setSubTask(false);
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setSubTask(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="space-y-4 md:space-y-6">
                {taskData?.subtasks?.length > 0 ? (
                  taskData.subtasks.map((subtask) => (
                    <div
                      key={subtask._id}
                      className="flex w-full items-center space-x-2"
                    >
                      <label className="flex w-full items-center space-x-2 p-1">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={subtask.status === "completed"}
                          onChange={() => handleCheckSubTask(subtask._id)}
                        />
                        <div className="flex w-full items-center justify-between">
                          <span>{subtask.title}</span>
                          <button
                            className="text-base-content/80 cursor-pointer p-1"
                            onClick={() => handleDeleteSubTask(subtask._id)}
                          >
                            <Trash className="size-4.5" />
                          </button>
                        </div>
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-base-content/80 text-sm">No Subtasks</p>
                )}
              </div>
            </div>

            {/* Activity Section */}
            <div className="card bg-base-100 space-y-6 p-5">
              <h2 className="text-md font-bold">Activity</h2>
              <div className="flex items-start gap-2">
                <div className="avatar mr-1">
                  <div className="size-9 rounded-full">
                    <img src={authUser.profilePicture} />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <textarea
                    className="textarea bg-base-200 w-full rounded-lg border-none shadow-none focus:outline-none"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      handleAddComment();
                    }}
                  >
                    Comment
                  </button>
                </div>
              </div>
              {/*  comment history */}
              {taskData.comments?.length > 0 ? (
                taskData.comments.map((comment) => (
                  <div className="flex items-start gap-3" key={comment._id}>
                    <div className="avatar">
                      <div className="size-9 rounded-full">
                        <img
                          src={comment.user.profilePicture}
                          alt={comment.user.fullName}
                        />
                      </div>
                    </div>
                    <div className="flex w-full justify-between space-y-1">
                      <div className="">
                        <p className="text-sm font-semibold">
                          {comment.user.fullName}{" "}
                          <span className="text-base-content/60 ml-1 text-xs font-light">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </p>
                        <p className="text-base-content/80 text-sm">
                          {comment.text}
                        </p>
                      </div>

                      <div className="dropdown dropdown-end">
                        <div
                          tabIndex={0}
                          role="button"
                          className="cursor-pointer p-1"
                        >
                          <Ellipsis className="size-4" />
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu bg-base-100 rounded-box z-1 w-30 p-2 shadow-sm"
                        >
                          <button
                            className="cursor-pointer p-1"
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            <a>Remove</a>
                          </button>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-base-content/60 italic">
                  No comments found for this task
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Status */}
            <div className="card bg-base-100 space-y-2 rounded-lg p-5 shadow-xs">
              <div className="flex flex-col gap-3">
                <span className="text-md font-bold">Status</span>
                <select
                  className="select select-sm select-bordered w-full border-none !text-[16px] shadow-none"
                  name="status"
                  value={taskData.status}
                  onChange={handleStatusChange}
                >
                  <option value="to-do">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* priority */}
            <div className="card bg-base-100 space-y-2 rounded-lg p-5 shadow-xs">
              <div className="flex flex-col gap-3">
                <span className="text-md font-bold">Priority</span>
                <select
                  className="select select-sm select-bordered w-full border-none !text-[16px] shadow-none"
                  name="priority"
                  value={taskData.priority}
                  onChange={handleChange}
                  onClick={() => {
                    handleUpdate();
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Due Date Label & Assignees */}
            <div className="card bg-base-100 space-y-6 p-5">
              {/* Due Date */}
              <div>
                <span className="text-base-content/60 text-sm font-semibold">
                  Due Date
                </span>
                <div className="mt-2 flex space-x-2 text-sm">
                  <Calendar className="text-base-content/70 size-4.5" />
                  <span>
                    {taskData.dueDate
                      ? format(new Date(taskData.dueDate), "dd-MM-yyyy")
                      : ""}
                  </span>
                </div>
              </div>

              {/* Assignees */}
              <div>
                <span className="text-base-content/60 text-sm font-semibold">
                  Assignees
                </span>
                <div className="flex items-center -space-x-3">
                  {taskData.assignedTo?.map((user) => (
                    <div key={user.userId._id} className="avatar mt-2">
                      <div className="border-base-100 w-8 rounded-full border">
                        <img src={user.userId.profilePicture} />
                      </div>
                    </div>
                  ))}
                  <button
                    className="bg-base-300 hover:bg-base-100 hover:outline-base-200 text-base-content/50 z-10 mt-2 flex size-7 cursor-pointer items-center justify-center rounded-full p-1 outline-2 outline-white"
                    onClick={() => setShowAssignModal(true)}
                  >
                    <Plus className="size-4.5" strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* Labels */}
              <div>
                <span className="text-base-content/60 text-sm font-semibold">
                  Labels
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <PriorityBadge priority="high" />
                  <StatusBadge status="in-progress" />
                </div>
              </div>
            </div>

            {/* Attachments */}
            {/* <div className="card bg-base-100 space-y-2 p-4">
              <span className="font-semibold">Attachments</span>
              <button className="btn btn-sm btn-outline w-full">
                + Add Files
              </button>
            </div> */}

            {showAssignModal && (
              <AssignUserModal
                projectId={taskData.project}
                taskId={taskData._id}
                assignedUsers={taskData.assignedTo}
                onAssignedUsersChange={(newAssignedTo) => {
                  console.log("TasksDetailPage: onAssignedUsersChange called with:", newAssignedTo);
                  setTaskData((prev) => {
                    console.log("TasksDetailPage: setTaskData updater - previous state:", prev);
                    const newState = {
                      ...prev,
                      assignedTo: newAssignedTo,
                    };
                    console.log("TasksDetailPage: setTaskData updater - new state:", newState);
                    return newState;
                  });
                  console.log("TasksDetailPage: after setTaskData call:", taskData); // This might be logged with the previous state
                }}
                onClose={() => {
                  console.log("Closing modal...");
                  setShowAssignModal(false);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TasksDetailPage;
