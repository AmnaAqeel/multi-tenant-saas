import Project from "../models/Project.model.js";
import Company from "../models/Company.model.js";
import Task from "../models/Tasks.model.js"
import { sendNotificationAndEmit } from "../utils/sendNotificationAndEmit.js";

// @route   GET /api/projects/
// @desc    get all projects, also supports filters
// @access  Authorized only
export const getAllProjects = async (req, res, next) => {
  const { role, companyId, _id } = req.user;

  try {
    let query = {
      company: companyId,
      isArchived: false,
    };

    //  Only apply teamMember filter if not admin
    if (role !== "admin" ) {
      query["teamMembers.user"] = _id; // Assuming teamMembers is array of objects
    }

    console.log("Final Query:", query);

    const projects = await Project.find(query).populate(
      "teamMembers.user",
      "fullName email profilePicture"
    )
    .populate("archivedBy", "fullName email profilePicture")
    

    res.json(projects);
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

  if (!title || !description) {
    return res.status(400).json({ msg: "Please provide all required fields" });
  }

  try {
    // Create and save the project
    const newProject = new Project({
      title,
      description,
      priority: priority || "medium",
      status: status || "in-progress",
      dueDate: dueDate || null,
      company: req.user.companyId,
      createdBy: req.user._id,
      lastUpdated: new Date(),
    });

    const savedProject = await newProject.save();

    // Push the project ID into the company
    await Company.findByIdAndUpdate(
      req.user.companyId,
      { $push: { projects: savedProject._id } },
      { new: true }
    );

    res.status(201).json(savedProject);
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
    let members = req.body; // [{ userId, role }, ...]

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
          projectId,
          createdBy: req.user._id,
        });
      }
    }

    project.lastUpdated = new Date();
    console.log("project after being updating and added members:", project);
    await project.save();

    res.status(200).json({ message: "Team members added successfully 💕" });
  } catch (error) {
    console.error("Error adding team members to project:", error);
    next(error);
  }
};
// @route   PATCH /api/projects/:id/remove-members
// @desc   receives an array and removes the team members
// @access  Authorized, Admin and project manager
export const removeTeamMembersFromProject = async (req, res, next) => {
  try {
    console.log("req.body", req.body)
    const { id: projectId } = req.params;
    const members  = req.body; // [id, ...]

    if (!Array.isArray(members)) {
      return res.status(400).json({ message: "Members should be an array." });
    }

    const project = await Project.findById(projectId);
    if (!project)
      return res.status(404).json({ message: "Project not found." });

    // Remove members from the teamMembers array
    project.teamMembers = project.teamMembers.filter(
      (member) => !members.includes(member.user.toString())
    );

    project.lastUpdated = new Date();
    await project.save();

    res.status(200).json({ message: "Team members removed successfully 💕" });
  } catch (error) {
    console.error(
      "Error removing team member from the project project:",
      error
    );
    next(error);
  }
};

// @route   GET /api/projects/:id
// @desc    Get a single project by ID
// @access  Authorized only
export const getProjectById = async (req, res, next) => {
  console.log("--- getProjectById WAS CALLED ---");
  const { id } = req.params;

  try {
    const project = await Project.findOne({
      _id: id,
      company: req.user.companyId,
    }).populate("teamMembers.user", "name email fullName profilePicture"); // Find by ID and company

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Create a simplified teamMembers array
    const simplifiedTeamMembers = [];
    for (const member of project.teamMembers) {
      if (member.user) {
        simplifiedTeamMembers.push({
          userId: member.user._id,
          name: member.user.fullName,
          email: member.user.email,
          profilePicture: member.user.profilePicture,
          projectRole: member.role,
        });
      }
    }

    const formattedProject = {
      _id: project._id,
      title: project.title,
      description: project.description,
      status: project.status,
      priority: project.priority,
      dueDate: project.dueDate,
      companyId: req.user.companyId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      teamMembers: simplifiedTeamMembers, // your clean format
    };

    res.json(formattedProject); // Return the project
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
      "fullName email role profilePicture"
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
  console.log("req.body", req.body);
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

// @route   PATCH /api/projects/:id/status
// @desc    Update a project's field
// @access  Admin and PM only
export const updateProjectStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log("status: ",status)

  try {
    // Find the project
    const project = await Project.findOne({
      _id: id,
      company: req.user.companyId,
    });
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    console.log("status :", status);
    const oldStatus = project.status; // Store old status for notification
    project.status = status; // Update status

    // If the status is 'archived', set the isArchived field to true
    if (status === "archived") {
      project.isArchived = true; // Set isArchived to true
      project.archivedBy= req.user._id
    }

    console.log("Project right before saving", project);
    // Save updated project 
    await project.save();

    // Notify all project members about status change
    for (const member of project.teamMembers) {
      await sendNotificationAndEmit({
        userId: member.user,
        message: `Project "${project.title}"'s status has been changed from ${oldStatus} to ${status}.`,
        type: "project_restored",
        companyId: project.company,
        projectId: project._id,
        createdBy: req.user._id,
      });
    }

    res
      .status(200)
      .json({ message: "Project status updated successfully", project });
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
    project.status = "on-hold"; // or set to any default active status you prefer
    project.isArchived = false;
    project.archivedBy= null;

    // Save the updated project
    await project.save();

    // Notify all project members about restoration
    for (const member of project.teamMembers) {
      await sendNotificationAndEmit({
        userId: member.user,
        message: `Project "${project.title}" has been restored and is now active again.`,
        type: "project_restored",
        companyId: project.company,
        projectId: project._id,
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
    // Step 1: Find the project (and ensure it belongs to the company)
    const project = await Project.findOne({
      _id: id,
      company: req.user.companyId,
    });

    if (!project) {
      return res
        .status(404)
        .json({ msg: "Project not found or not authorized to delete" });
    }

    // Step 2: Delete all tasks related to this project
    await Task.deleteMany({ project: id });

    // Step 3: Remove project reference from the company
    await Company.updateOne(
      { _id: req.user.companyId },
      { $pull: { projects: id } }
    );

    // Step 4: Delete the project itself
    await Project.deleteOne({ _id: id });

    res.json({ msg: "Project and related tasks deleted successfully" });
  } catch (error) {
    console.error("Error deleting the project:", error);
    next(error);
  }
};

// @route   GET /api/projects/archived/list
// @desc    get all archived projects
// @access  Authorized and Admin only
export const getArchivedProjects = async (req, res, next) => {
  console.log("Entered archive projects api");
  const companyId = req.user.companyId;
  try {
    const projects = await Project.find({
      status: "archived",
      isArchived: true, // Only archived projects
      company: companyId,
    })
    .populate("archivedBy", "fullName email profilePicture")
    .populate("teamMembers.user", "fullName email profilePicture");

    console.log("Projects:", projects);

    res.json(projects); // Serve the cuties that are chilling in archive
  } catch (error) {
    console.error("Error fetching archived projects:", error);
    next(error); // Let the error handler slay
  }
};
