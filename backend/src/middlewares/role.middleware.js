import Project from "../models/Project.model.js";

export const roleMiddleware = (...allowedRoles) => (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied. No role assigned." });
    }
  
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires ${allowedRoles} role.` });
    }
  
    next(); // User has the correct role → proceed
  };


//Things to keep in Mind: We are assigning editor to those we are going to make project members only, rest will be members
export const projectRoleMiddleware = (...allowedRoles) => async (req, res, next) => {
  console.log("PROJECT ROLE MIDDLEWARE TRIGGERED")
  if (!req.user || !req.user.role) {
    return res.status(403).json({ message: "Access denied. No role assigned." });
  }

  // Check if the user role is in the allowed roles array
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied. Requires ${allowedRoles.join(", ")} role.` });
  }

  // If the role is allowed, check if it’s an admin or project manager
  const projectId = req.params.id || req.params.projectId;
  console.log(`🔑 Project ID: ${projectId}`);
  const project = await Project.findById(projectId);
  console.log(`project:`, project);

  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  }

  // If the user is an admin of the company (admin role)
  if (req.user.role === "admin") {
    return next(); // Admin is always allowed, they manage everything
  }

  // If the user is an editor, we check if they are a project manager
  if (req.user.role === "editor") {
    const isProjectManager = project.teamMembers.some(
      (member) => member.user.toString() === req.user._id.toString() && member.role === "project-manager"
    );

    if (isProjectManager) {
      return next(); // Editor who is also a project manager can pass
    }
  }

  // If the user is a member, they should not have access to modify project data
  if (req.user.role === "member") {
    return res.status(403).json({ message: "Access denied. Member can't modify projects." });
  }

  // If the role is not admin, editor, or a project manager, deny access
  return res.status(403).json({ message: "Access denied. Requires admin or project manager role." });
};
