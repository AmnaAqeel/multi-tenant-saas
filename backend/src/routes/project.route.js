// routes/inviteRoutes.js

import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware, projectRoleMiddleware } from "../middlewares/role.middleware.js";
import { validateInput } from "../middlewares/ValidateInput.middleware.js";
import { createProjectValidation} from "../validations/project.validation.js";
import { createTaskValidation } from "../validations/task.validation.js";
import {
    getAllProjects,
    createProject,
    addTeamMembersToProject,
    getAllProjectMembers,
    getProjectById,
    updateProject,
    updateProjectStatus,
    restoreProject,
    deleteProject,
    getArchivedProjects,
} from "../controllers/project.controller.js";

import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    updateTaskStatus,
    deleteTask,
    updateTaskMembers,
    getAllSubtasksForTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    getAllCommentsForTask,
    addCommentToTask,
    deleteCommentFromTask,
} from "../controllers/task.controller.js";

const router = express.Router();

// *** Project Routes ***

router.get("/", authMiddleware, getAllProjects);// Get all projects (with optional query ?status=archived&priority=high)
router.post("/", authMiddleware, roleMiddleware("admin"), validateInput(createProjectValidation), createProject); // Create a project
router.patch("/:id/add-members", authMiddleware, projectRoleMiddleware("admin", "editor"), addTeamMembersToProject); //Add project members
router.get("/:id/members", authMiddleware, projectRoleMiddleware("admin", "editor"), getAllProjectMembers); // Get all members of a specific project
router.get("/:id", authMiddleware, getProjectById); // Get a single project by ID
router.patch("/:id", authMiddleware,projectRoleMiddleware("admin", "editor"), updateProject); // Update a project
router.patch("/:id/status", authMiddleware, projectRoleMiddleware("admin", "editor"), updateProjectStatus); // Route to update the project status only
router.patch("/:id/restore", authMiddleware, projectRoleMiddleware("admin"), restoreProject); // Restore an archived project
router.delete("/:id", authMiddleware, projectRoleMiddleware("admin"), deleteProject); // Delete a project
router.get("/archived/list", authMiddleware, roleMiddleware("admin"), getArchivedProjects); // Shortcut to get archived projects

// *** Task Routes ***

// Get all tasks for a project (optional query parameters for filtering)
router.get("/:projectId/tasks", authMiddleware, getAllTasks); // Get all tasks for a project
router.post("/:projectId/tasks", authMiddleware, projectRoleMiddleware("admin", "editor"), validateInput(createTaskValidation), createTask); // Create a task for a project
router.get("/:projectId/tasks/:taskId", authMiddleware, getTaskById); // Get task by ID within project
router.patch("/:projectId/tasks/:taskId", authMiddleware, projectRoleMiddleware("admin", "editor"), updateTask); // Update task details
router.patch("/:projectId/tasks/:taskId/status", authMiddleware, updateTaskStatus); // Update task status
router.patch("/:projectId/tasks/:taskId/update-members", authMiddleware, projectRoleMiddleware("admin", "editor"), updateTaskMembers); //remove task members
router.delete("/:projectId/tasks/:taskId", authMiddleware, projectRoleMiddleware("admin", "editor"), deleteTask); // Delete task

// *** Subtask Routes (nested under tasks) ***
router.get("/:projectId/tasks/:taskId/subtasks", authMiddleware, projectRoleMiddleware("admin", "editor"), getAllSubtasksForTask); // gets all subtasks
router.post("/:projectId/tasks/:taskId/subtasks", authMiddleware, projectRoleMiddleware("admin", "editor"), addSubtask); // Add subtask to a task
router.patch("/:projectId/tasks/:taskId/subtasks/:subtaskId", authMiddleware, projectRoleMiddleware("admin", "editor"), updateSubtask); // Update a subtask
router.delete("/:projectId/tasks/:taskId/subtasks/:subtaskId", authMiddleware, projectRoleMiddleware("admin", "editor"), deleteSubtask); // Delete a subtask

// *** Comment Routes (nested under tasks) ***
router.post("/:projectId/tasks/:taskId/comments", authMiddleware, addCommentToTask); // Add comment to task
router.delete("/:projectId/tasks/:taskId/comments/:commentId", authMiddleware, deleteCommentFromTask); // Delete comment from task
router.get("/:projectId/tasks/:taskId/comments", authMiddleware, getAllCommentsForTask); // get all comment for task


export default router;
