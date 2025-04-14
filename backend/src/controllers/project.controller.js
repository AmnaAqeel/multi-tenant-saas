import Project from "../models/Project.model.js";
import { sendNotificationAndEmit } from "../utils/sendNotificationAndEmit.js";

// @route   GET /api/projects/
// @desc    get all projects, also supports filters
// @access  Authorized only
export const getAllProjects = async (req, res, next) => {
  const { status, priority } = req.query;

  try {
    let query = { company: req.user.companyId, isArchived: false }; // Always filter by the companyId from the token

    // If filters are provided, apply them to the query
    if (status) query.status = status;
    if (priority) query.priority = priority;

    console.log(`query after filters:`, query);

    const projects = await Project.find(query); // Fetch projects based on the query

    res.json(projects); // Return the projects in the response
  } catch (error) {
    console.error("Error fetching projects:", error);
    next(error);
  }
};

// @route   POST /api/projects/
// @desc    create project...
// @access  Authorized only
export const createProject = async (req, res, next) => {
  const { title, description, priority, status, dueDate } = req.body;

  // Validate required fields
  if (!title || !description) {
    return res.status(400).json({ msg: "Please provide all required fields" });
  }

  try {
    const newProject = new Project({
      title,
      description,
      priority: priority || "medium", // Default priority if not provided
      status: status || "in-progress", // Default status
      dueDate: dueDate || null,
      company: req.user.companyId, // Set the companyId to the user's company
      createdBy: req.user._id, // Created by the current user
      lastUpdated: new Date(), // Set the last updated to the current date
    });

    const project = await newProject.save(); // Save the project to the database

    res.status(201).json(project); // Return the created project
  } catch (error) {
    console.error("Error creating project:", error);
    next(error);
  }
};

// @route   PATCH /api/projects/:id/add-members
// @desc    send an array of team members to add into the project
// @access  Authorized, Admin and project manager
export const addTeamMembersToProject = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;
    let { members } = req.body; // [{ userId, role }, ...]

    const project = await Project.findById(projectId);
    if (!project)
      return res.status(404).json({ message: "Project not found." });

    // Normalize to array if it's just a single object
    if (!Array.isArray(members)) {
      if (members?.userId && members?.role) {
        members = [members]; // wrap it in an array 💅
      } else {
        return res.status(400).json({ message: "Invalid member format." });
      }
    }

    for (const { userId, role } of members) {
      const alreadyExists = project.teamMembers.some(
        (m) => m.user.toString() === userId
      );

      if (!alreadyExists) {
        project.teamMembers.push({ user: userId, role });

        // 🎉 Create a notification for the newly added member
        await sendNotificationAndEmit({
          userId,
          message: `You've been added to the project: "${project.title}"`,
          type: "project_assigned",
          companyId: project.company,
          createdBy: req.user._id,
        });
      }
    }

    project.lastUpdated = new Date();
    await project.save();


    res.status(200).json({ message: "Team members added successfully 💕" });
  } catch (error) {
    console.error("Error adding team members to project:", error);
    next(error);
  }
};

// @route   GET /api/projects/:id
// @desc    Get a single project by ID
// @access  Authorized only
export const getProjectById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const project = await Project.findOne({
      _id: id,
      company: req.user.companyId,
    }); // Find by ID and company

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    res.json(project); // Return the project
  } catch (error) {
    console.error("Error getting the project:", error);
    next(error);
  }
};

// @route   GET /api/projects/:id
// @desc    Get a single project by ID
// @access  Authorized only
export const getAllProjectMembers = async (req, res, next) => {
  const { id } = req.params;
  console.log("projectId from getAllProjectMembers:", id);

  try {
    // Find the project by its ID
    const project = await Project.findById(id).populate(
      "teamMembers.user",
      "name email role"
    ); // Populating user details (name, email, role) from the teamMembers field

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Return the team members of the project
    res.status(200).json({ members: project.teamMembers });
  } catch (error) {
    console.error("Error fetching project members:", error);
    next(error);
  }
};

// @route   PATCH /api/projects/:id
// @desc    Update a project's field
// @access  Authorized and Admin only
export const updateProject = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, priority, dueDate } = req.body;

  try {
    // Dynamically build the update object
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (priority !== undefined) updateFields.priority = priority;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;

    const project = await Project.findOneAndUpdate(
      { _id: id, company: req.user.companyId },
      { $set: updateFields },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    res.status(200).json({ msg: "Project updated successfully", project });
  } catch (error) {
    console.error("Error getting the project:", error);
    next(error);
  }
};

// @route   PATCH /api/projects/:id
// @desc    Update a project's field
// @access  Admin and PM only
export const updateProjectStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Find the project
    const project = await Project.findOne({
      _id: id,
      company: req.user.companyId,
    });
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    const oldStatus = project.status; // Store old status for notification
    project.status = status; // Update status

    // If the status is 'archived', set the isArchived field to true
    if (status === "archived") {
      project.isArchived = true; // Set isArchived to true
    }

    // Save updated project
    await project.save();

    // Notify all project members about status change
    for (const member of project.teamMembers) {
      await sendNotificationAndEmit({
        userId: member.user,
        message: `Project "${project.title}" has been restored and is now active again.`,
        type: "project_restored",
        companyId: project.company,
        createdBy: req.user._id,
      });
    }

    res
      .status(200)
      .json({ msg: "Project status updated successfully", project });
  } catch (error) {
    console.error("Error updating project status:", error);
    next(error);
  }
};

// @route   PATCH /api/projects/:id/restore
// @desc    specifically for restoring an archived project
// @access  Admin only
export const restoreProject = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Find the project
    const project = await Project.findOne({
      _id: id,
      company: req.user.companyId,
    });
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Check if the project is archived
    if (project.status !== "archived") {
      return res
        .status(400)
        .json({ msg: "Project is not archived, no need to restore." });
    }

    // Restore the project by changing its status and setting isArchived to false
    project.status = "not-started"; // or set to any default active status you prefer
    project.isArchived = false;

    // Save the updated project
    await project.save();

    // Notify all project members about restoration
    for (const member of project.teamMembers) {
      await sendNotificationAndEmit({
        userId: member.user,
        message: `Project "${project.title}" has been restored and is now active again.`,
        type: "project_restored",
        companyId: project.company,
        createdBy: req.user._id,
      });
    }

    res.status(200).json({ msg: "Project restored successfully", project });
  } catch (error) {
    console.error("Error restoring project:", error);
    next(error);
  }
};

// @route   DELETE /api/projects/:id
// @desc    delete a project
// @access  Authorized and Admin only
export const deleteProject = async (req, res, next) => {
  const { id } = req.params;

  try {
    const project = await Project.findOneAndDelete({
      _id: id,
      company: req.user.companyId,
    }); // Ensure it belongs to the company

    if (!project) {
      return res
        .status(404)
        .json({ msg: "Project not found or not authorized to delete" });
    }

    res.json({ msg: "Project deleted successfully" }); // Confirmation message
  } catch (error) {
    console.error("Error deleting the project:", error);
    next(error);
  }
};

// @route   GET /api/projects/archived/list
// @desc    get all archived projects
// @access  Authorized and Admin only
export const getArchivedProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      company: req.user.companyId,
      isArchived: true, // Only archived projects
    });

    res.json(projects); // Serve the cuties that are chilling in archive
  } catch (error) {
    console.error("Error fetching archived projects:", error);
    next(error); // Let the error handler slay
  }
};
