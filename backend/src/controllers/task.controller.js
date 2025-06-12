import Project from "../models/Project.model.js";
import Task from "../models/Tasks.model.js";
import mongoose from "mongoose";
import { sendNotificationAndEmit } from "../utils/sendNotificationAndEmit.js";


// TODO: the Editor can create projects and tasks and admin won't be a part of them and currently admin cant
//  see them either with this setup

// @route   GET /api/projects/tasks
// @desc    List all tasks of a user against his selected company
// @access  Authorized only
export const getTasks = async (req, res, next) => {
  console.log("get Tasks api was hit...")
  const { _id } = req.user; // Get the user ID from the request object
  const {companyId} = req.user;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  try {
    const tasks = await Task.find({
      $and: [
        {
          $or: [{ "assignedTo.userId": _id }, { createdBy: _id }],
        },
        { companyId: companyId } // Add the companyId condition here
      ]
    })
    .populate("assignedTo.userId", "fullName email profilePicture")
    .populate("project", "title isArchived")
    .populate("comments.user", "fullName email profilePicture");

    console.log("tasks:", tasks);
    console.log("id:", _id);

    res.status(200).json({
      success: true,
      message: tasks.length
        ? `Fetched ${tasks.length} tasks assigned to you.`
        : "No tasks assigned to you yet.",
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    next(error);
  }
};

// @route   GET /api/projects/:projectId/tasks
// @desc    List all tasks of a specific project (admin only)
// @access  Authorized only
export const getAllTasks = async (req, res, next) => {
  console.log("entering getAllTasks");
  const { projectId } = req.params;
  const { status, priority } = req.query; // Optional query parameters for filtering

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const filter = { project: projectId };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    const tasks = await Task.find(filter)
    .populate("assignedTo.userId", "fullName email profilePicture")
    console.log("tasks:", tasks);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    next(error);
  }
};

// @route   POST /api/projects/:projectId/tasks
// @desc   create a task
// @access  Admin and Project Manager
export const createTask = async (req, res, next) => {
  const { projectId } = req.params;
  const { title, description, assignedTo, priority, status, dueDate } =
    req.body;

  try {
    const projectData = await Project.findById(projectId);
    if (!projectData) {
      return res.status(404).json({ message: "Project not found" });
    }

    const validUsers = assignedTo.every((userObj) =>
      projectData.teamMembers.some(
        (member) => member.user.toString() === userObj.userId.toString()
      )
    );

    if (!validUsers) {
      return res
        .status(400)
        .json({ message: "One or more users are not part of the project" });
    }

    const newTask = new Task({
      title,
      description,
      priority: priority || "medium",
      status: status || "to-do",
      project: projectId,
      dueDate: dueDate || null,
      assignedTo: assignedTo.map((userObj) => ({
        userId: new mongoose.Types.ObjectId(userObj.userId),
      })),
      createdBy: req.user._id,
    });

    await newTask.save();

    // 🔥 Notify each assigned user + emit real-time socket event
    for (const userObj of assignedTo) {
      await sendNotificationAndEmit({
        userId: userObj.userId,
        message: `You have been assigned a new task: "${title}" in the project "${projectData.title}"`,
        type: "task_assigned",
        companyId: projectData.company,
        projectId,
        createdBy: req.user._id,
      });
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating tasks:", error);
    next(error);
  }
};

// @route   GET /api/projects/:projectId/tasks/:taskId
// @desc    get a specific task by Id
// @access  AUthorized only
export const getTaskById = async (req, res, next) => {
  const { projectId, taskId } = req.params;

  try {
    const project = await Project.findById(
      new mongoose.Types.ObjectId(projectId)
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = await Task.findOne({
      _id: taskId,
      project: projectId,
    }).populate("assignedTo.userId", "fullName email profilePicture")
    .populate("comments.user", "fullName email profilePicture")


    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    next(error);
  }
};

// @route   PATCH /api/projects/:projectId/tasks/:taskId
// @desc    Update general task details (without comments and assignedTo)
// @access  Admin and Project Manager
export const updateTask = async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const { title, description, priority } = req.body;

  try {
    const project = await Project.findById(
      new mongoose.Types.ObjectId(projectId)
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.priority = priority || task.priority;
    task.updatedAt = new Date();

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    console.error("Error updating tasks:", error);
    next(error);
  }
};

// @route   PATCH /api/projects/:projectId/tasks/:taskId/status
// @desc    Update task status
// @access  Assigned users
//POINT to remember, the company admin is still not allowed to update task status, because he isnt among the team member array of tasks
export const updateTaskStatus = async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const { status } = req.body; // Just the status field here
  const { role, _id: userId, companyId } = req.user;

  if (!status) {
    return res.status(400).json({ message: "Status is required." });
  }

  try {
    const task = await Task.findById(taskId).populate("createdBy", "fullName");
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Check if the user is assigned to this task OR is the project manager
    const assignedUserIds = task.assignedTo.map((member) =>
      member.userId.toString()
    );
    const isAssigned = assignedUserIds.includes(userId.toString());
    const isProjectManager =
      task.createdBy._id.toString() === userId.toString();

    //  Authorization check
    if (
      !isAssigned &&
      !isProjectManager &&
      role !== "admin" &&
      role !== "editor"
    ) {
      return res.status(403).json({
        message: "You are not authorized to change the status of this task.",
      });
    }

    const oldStatus = task.status;
    task.status = status; // Update the task status
    task.updatedAt = new Date();

    //  Notification logic
    const statusChanged = status !== oldStatus;
    const shouldNotifyPM =
      statusChanged &&
      !isProjectManager && // Don't notify if the PM did it themselves
      task.createdBy?._id?.toString() !== userId.toString(); // Just to be sure

    // If the status is changed, notify the project manager
    if (shouldNotifyPM) {
      await sendNotificationAndEmit({
        userId: task.createdBy._id,
        message: `${req.user.fullName} changed the status of task "${task.title}" from "${oldStatus}" to "${status}".`,
        type: "task_status_changed",
        companyId: companyId,
        projectId,
        createdBy: userId,
      });
    }

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    console.error("Error updating task status:", error);
    next(error);
  }
};

// @route   PATCH /api/projects/:projectId/tasks/:taskId/update-members
// @desc    Add and/or remove members from a task
// @access  Admin and Project Manager
export const updateTaskMembers = async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const { assignedToAdd = [], assignedToRemove = [] } = req.body;

  try {
    const projectObjId = new mongoose.Types.ObjectId(projectId);
    const task = await Task.findOne({ _id: taskId, project: projectObjId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Convert ObjectIds to string for easy comparison
    const currentUserIds = task.assignedTo.map((member) =>
      member.userId.toString()
    );
    const addUserIds = assignedToAdd.map((u) => u.userId);
    const removeUserIds = assignedToRemove.map((u) => u.userId);

    // ➕ Add users who aren't already assigned
    for (const userId of addUserIds) {
      if (!currentUserIds.includes(userId)) {
        task.assignedTo.push({ userId });

        await sendNotificationAndEmit({
          userId,
          message: `You have been added to the task: "${task.title}".`,
          type: "task_assigned",
          companyId: req.user.companyId,
          projectId,
          createdBy: req.user._id,
        });
      }
    }

    // ➖ Remove users
    task.assignedTo = task.assignedTo.filter(
      (member) => !removeUserIds.includes(member.userId.toString())
    );

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    console.error("Error updating task members:", error);
    next(error);
  }
};

// @route   DELETE /api/projects/:projectId/tasks/:taskId
// @desc    delete a task
// @access  Admin and Project Manager
export const deleteTask = async (req, res, next) => {
  const { projectId, taskId } = req.params;

  try {
    const project = await Project.findById(
      new mongoose.Types.ObjectId(projectId)
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = await Task.findOneAndDelete({
      _id: taskId,
      project: projectId,
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting tasks:", error);
    next(error);
  }
};

// ***SUBTASK ROUTES***

// @route   GET /api/projects/:projectId/tasks/:taskId/subtasks
// @desc    Get all subtasks for a task
// @access  Authorized only.
export const getAllSubtasksForTask = async (req, res, next) => {
  console.log("req.params", req.params);
  const { projectId, taskId } = req.params;

  const projectObjId = new mongoose.Types.ObjectId(projectId);

  try {
    const task = await Task.findOne({ _id: taskId, project: projectObjId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task.subtasks);
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    next(error);
  }
};

// @route   POST /api/projects/:projectId/tasks/:taskId/subtasks
// @desc    Add a subtask to a task
// @access  Authorized only
export const addSubtask = async (req, res, next) => {
  console.log("req.body:", req.body);
  const { projectId, taskId } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ msg: "Title is required for subtask" });
  }
  const projectObjId = new mongoose.Types.ObjectId(projectId);

  try {
    const task = await Task.findOne({ _id: taskId, project: projectObjId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const newSubtask = {
      title,
      status: "to-do",
    };

    task.subtasks.push(newSubtask);
    await task.save();

    // get the subtask that *was just added*
    const addedSubtask = task.subtasks[task.subtasks.length - 1];

    res.status(201).json(addedSubtask); // Return newly created subtasks
  } catch (error) {
    console.error("Error adding subtask:", error);
    next(error);
  }
};

// @route   PATCH /api/projects/:projectId/tasks/:taskId/subtasks/:subtaskId
// @desc    Update a subtask inside a task
// @access  Authorized only
export const updateSubtask = async (req, res, next) => {
  console.log("req.body:", req.body);
  const { projectId, taskId, subtaskId } = req.params;
  const { status } = req.body;

  const projectObjId = new mongoose.Types.ObjectId(projectId);

  try {
    const task = await Task.findOne({ _id: taskId, project: projectObjId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }
    console.log("status:", status);
    if (status) subtask.status = status;

    await task.save();
    res.status(200).json(subtask);
  } catch (error) {
    console.error("Error updating subtask:", error);
    next(error);
  }
};

// @route   DELETE /api/projects/:projectId/tasks/:taskId/subtasks/:subtaskId
// @desc    Delete a subtask from a task
// @access  Authorized only
export const deleteSubtask = async (req, res, next) => {
  const { projectId, taskId, subtaskId } = req.params;

  const projectObjId = new mongoose.Types.ObjectId(projectId);

  try {
    const task = await Task.findOne({ _id: taskId, project: projectObjId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    task.subtasks.pull(subtask);
    await task.save();

    res.status(200).json({ message: "Subtask deleted successfully" });
  } catch (error) {
    console.error("Error deleting subtask:", error);
    next(error);
  }
};

// ***COMMENTS ROUTES***

// @route   GET /api/projects/:projectId/tasks/:taskId/comments
// @desc    Get all comments for a task
// @access  Authorized only
export const getAllCommentsForTask = async (req, res, next) => {
  const { projectId, taskId } = req.params;

  try {
    const task = await Task.findOne({
      _id: taskId,
      project: projectId,
    }).populate("comments.user", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    next(error);
  }
};

// @route   POST /api/projects/:projectId/tasks/:taskId/comments
// @desc    Add a comment to a task
// @access  Authorized only
export const addCommentToTask = async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ msg: "Comment text is required" });
  }

  try {
    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const newComment = {
      user: req.user._id,
      text,
      createdAt: new Date(),
    };

    task.comments.push(newComment);
    await task.save();

    const companyId = req.user.companyId;
    const createdBy = req.user._id;
    const taskTitle = task.title;

    const assignedUserIds = task.assignedTo
      .map((member) => member.userId.toString())
      .filter((id) => id !== createdBy.toString());

    // Notify assigned users (excluding commenter)
    for (const userId of assignedUserIds) {
      await sendNotificationAndEmit({
        userId,
        message: `New comment on a task you're assigned to: "${taskTitle}"`,
        type: "new_comment",
        companyId,
        projectId,
        createdBy,
      });
    }

    // Notify task creator (if they aren't the one commenting)
    const creatorId = task.createdBy.toString();
    if (creatorId !== createdBy.toString()) {
      await sendNotificationAndEmit({
        userId: creatorId,
        message: `New comment on your created task: "${taskTitle}"`,
        type: "new_comment",
        companyId,
        projectId,
        createdBy,
      });
    } 
    await task.populate("comments.user", "fullName email profilePicture");
    const addedComment = task.comments.at(-1); // cleaner and modern

    res.status(201).json(addedComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    next(error);
  }
};

// @route   DELETE /api/projects/:projectId/tasks/:taskId/comments/:commentId
// @desc    Delete a comment from a task
// @access  Authorized only
export const deleteCommentFromTask = async (req, res, next) => {
  const { projectId, taskId, commentId } = req.params;

  try {
    const task = await Task.findOne({ _id: taskId, project: projectId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    task.comments.pull(comment);
    await task.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    next(error);
  }
};
