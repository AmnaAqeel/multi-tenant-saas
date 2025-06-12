import cloudinary from "../config/cloudinary.js";

import Company from "../models/Company.model.js";
import User from "../models/User.model.js";
import Task from "../models/Tasks.model.js";
import Project from "../models/Project.model.js";
import Notification from "../models/Notification.model.js"

import { sendNotificationAndEmit } from "../utils/sendNotificationAndEmit.js"
import {attachCompanyNames} from "../utils/attachCompanyNames.js";


// @route   POST /api/companies/
// @desc    create company, generate new accessToken also containing the company he just created
// @access  Authorized only
export const createCompany = async (req, res, next) => {
  try {
    const { name, description, website, location, employees, logo } = req.body;
    const createdBy = req.user._id;

    if (!name) {
      const error = new Error("Company name is required");
      error.statusCode = 400;
      return next(error);
    }

    if (
      website &&
      !/^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(website)
    ) {
      const error = new Error("Invalid website URL format");
      error.statusCode = 400;
      return next(error);
    }

    // 🔹 Upload logo if exists
    let logoUrl;
    if (logo) {
      const uploadResponse = await cloudinary.uploader.upload(logo);
      logoUrl = uploadResponse.secure_url;
    }

    // 🔹 Create new company
    const company = new Company({
      name,
      description,
      website,
      location,
      employees,
      createdBy,
      logo: logoUrl,
      members: [
        {
          userId: createdBy,
          role: "admin",
        },
      ],
    });

    await company.save();

    // 🔹 Update user's company array and activeCompany
    const user = await User.findById(createdBy);
    user.company.push({ companyId: company._id, role: "admin" });

    if (!user.activeCompany) {
      user.activeCompany = company._id;
    }

    await user.save();

    res.status(201).json({
      message: "Company created successfully",
    });
  } catch (error) {
    console.error("Error creating company:", error);
    next(error);
  }
};

// @route   GET /api/companies/my
// @desc    get all user's companies aginst userId
// @access  Authorized only
export const getUserCompanies = async (req, res, next) => {
  console.log(`req.user:`, req.user);
  try {
    const userId = req.user._id;

    // Select - Just give me the company field — I don’t need other user details like email, password, etc.
    // Populate - Inside the company array, the companyId is just an ID (ObjectId). Please replace it with the actual company document,
    // but only give me the name and logo fields
    const user = await User.findById(userId)
      .select("company")
      .populate("company.companyId", "name logo");

    console.log(`user:`, user);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    //We're taking the company array from the user document and transforming the whole array(each object) into a new, cleaner format
    const companies = user.company.map((each) => ({
      _id: each.companyId?._id,
      name: each.companyId?.name,
      logo: each.companyId?.logo,
      role: each.role,
    }));

    console.log(`companies:`, companies);

    res.status(200).json({ companies });
  } catch (error) {
    console.error("Error getting user company:", error);
    next(error);
  }
};

// @route   PATCH /api/companies/switch/:id
// @desc    switch company from list of companies, generate new accessToken and modify activeCompany
// @access  Authorized only
export const switchCompany = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id: companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const companyEntry = user.company.find(
      (entry) => entry.companyId.toString() === companyId
    );

    if (!companyEntry) {
      return res.status(403).json({ message: "You are not part of this company." });
    }

    user.activeCompany = companyId;
    await user.save();

    return res.status(200).json({ message: "Company switched successfully." });
  } catch (error) {
    console.error("Error switching company:", error);
    next(error);
  }
};


// @route   GET /api/companies/:id
// @desc    get company details by id
// @access  Admin only
export const getCompanyById = async (req, res, next) => {
  try {
    const companyId = req.params.id;

    const company = await Company.findById(companyId).populate(
      "members.userId",
      "name email"
    ); // optional
    //   .populate("projects", "name status"); /u/ optional, once project model is added

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(company);
  } catch (error) {
    console.error("Error getting company by ID:", error);
    next(error);
  }
};

//  Essential basic team management Routes

// @route   GET /api/companies/:id/members
// @desc    List all members of a specific company (admin only)
// @access  Admin only
export const getCompanyMembers = async (req, res, next) => {
  console.log("req.user", req.user)
  const userId = req.user._id;
  const { id: companyId } = req.params;

  try {
     // Check if company exists
     const company = await Company.findById(companyId);
     if (!company) {
       return res.status(404).json({ message: "Company not found." });
     }

     const users = await User.find({
      _id: { $ne: userId },
      company: { $elemMatch: { companyId: companyId } }
    }) //inside user doument, inside company array
      .select("fullName email company role profilePicture") //specific fields to return
      .lean(); //converts the query result to a plain JavaScript object

      console.log(`users:`, users);

    const filteredUsers = users.map((user) => {
      const currentCompany = user.company.find(
        (c) => c.companyId.toString() === companyId.toString()
      );

      console.log(`currentCompany:`, currentCompany);

      //processes each user to find the correct company in the company array and extracts the role for that specific company
      return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: currentCompany?.role || "member",
        profilePic: user.profilePicture,
      };
    });
    // console.log(`filteredUsers:`, filteredUsers);

    res.status(200).json({ members: filteredUsers });
  } catch (error) {
    console.error("Error fetching company members:", error);
    next(error);
  }
};

// @route   DELETE /api/companies/:id/members/:userId
// @desc    Remove a user from a company
// @access  Private + Admin only
export const removeMember = async (req, res) => {
  const { id: companyId, userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const company = user.company.find(
      (c) => c.companyId.toString() === companyId
    );

    if (!company) {
      return res.status(404).json({
        message: "This user is not a member of the specified company.",
      });
    }

    // Remove the company from the user's company list
    user.company = user.company.filter(
      (c) => c.companyId.toString() !== companyId
    );

    // If the removed company was active, clear it
    if (user.activeCompany?.toString() === companyId.toString()) {
      user.activeCompany = null;
    }

    await user.save();

    res.status(200).json({ message: "Member removed from company." });
  } catch (error) {
    console.error("Error= removing member:", error);
    next(error);
  }
};

//Deep Company Management and Role Handling routes

// @route   PATCH /api/companies/:id/members/update-roles
// @desc    Change role of a member in a company
// @access  Private + Admin only
export const updateMultipleMemberRoles = async (req, res) => {
  const { id: companyId } = req.params;
  const { updates } = req.body; // Array: [{ userId, newRole }]

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "No role updates provided." });
  }

  try {
    const updatedUsers = [];

    for (const update of updates) {
      const { userId, newRole } = update;

      if (!["admin", "editor", "member"].includes(newRole)) continue;

      const user = await User.findById(userId);
      if (!user) continue;

      const companyEntry = user.company.find((c) => c.companyId.toString() === companyId);
      if (!companyEntry || companyEntry.role === newRole) continue;

      const oldRole = companyEntry.role;
      companyEntry.role = newRole;
      await user.save();

      updatedUsers.push({ userId, oldRole, newRole });

      await sendNotificationAndEmit({
        userId,
        message: `Your role has been changed from ${oldRole} to ${newRole} in the company.`,
        type: "role_changed",
        companyId,
        createdBy: req.user._id,
      });
    }

    res.status(200).json({
      message: "Roles updated successfully.",
      updatedUsers,
    });
  } catch (error) {
    console.error("Error updating roles:", error);
    res.status(500).json({ message: "Server error while updating roles." });
  }
};

// @route   PATCH /api/companies/:id
// @desc    Update company name or metadata
// @access  Private + Admin only
export const updateCompany = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  //  Optional: restrict which fields can be updated
  const allowedUpdates = ["name", "description", "location", "website"];
  const invalidFields = Object.keys(updates).filter(
    (key) => !allowedUpdates.includes(key)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({ message: `Invalid fields: ${invalidFields.join(", ")}` });
  }

  //  Optional: prevent empty string updates
  for (let key of Object.keys(updates)) {
    if (typeof updates[key] === "string" && updates[key].trim() === "") {
      return res.status(400).json({ message: `${key} cannot be empty.` });
    }
  }

  try {
    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ message: "Company not found." });

    // 🛠 Apply valid updates
    Object.keys(updates).forEach((key) => {
      company[key] = updates[key];
    });

    await company.save();

    res.status(200).json({ message: "Company updated.", company });
  } catch (error) {
    console.error("Error updating company:", error);
    next(error);
  }
};


// @route   DELETE /api/companies/:id
// @desc    Delete a company
// @access  Private + Admin only
export const deleteCompany = async (req, res, next) => {
  const { id: companyId } = req.params;

  try {
    // 1. Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // 2. Get all project IDs linked to this company
    const projectIds = company.projects || [];

    // 3. Delete all tasks under those projects
    if (projectIds.length > 0) {
      await Task.deleteMany({ project: { $in: projectIds } });
    }

    // 4. Delete all projects linked to the company
    await Project.deleteMany({ _id: { $in: projectIds } });

    // 5. Delete the company itself
    await Company.deleteOne({ _id: companyId });

    // 6. Remove the company from all users' company array
    await User.updateMany(
      { "company.companyId": companyId },
      {
        $pull: {
          company: { companyId },
        },
        $unset: {
          activeCompany: ""
        }
      }
    );

    // 7. Done
    res.status(200).json({ message: "Company, related projects, and tasks deleted successfully." });

  } catch (error) {
    console.error("Error deleting company:", error);
    next(error);
  }
};


// @route   POST /api/companies/:id/leave
// @desc    Leave a company
// @access  Private (any member)
export const leaveCompany = async (req, res, next) => {
  const { id: companyId } = req.params;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // 🔹 Remove company from user's company list
    user.company = user.company.filter(
      (c) => c.companyId.toString() !== companyId
    );

    // 🔹 Reset activeCompany if it's the same
    if (user.activeCompany?.toString() === companyId) {
      user.activeCompany = null;
    }

    await user.save();

    // 🔹 Remove user from the company's members array
    await Company.updateOne(
      { _id: companyId },
      { $pull: { members: { userId } } }
    );

    // 🔹 Remove user from all projects' teamMembers inside this company
    await Project.updateMany(
      { company: companyId },
      { $pull: { teamMembers: { user: userId } } }
    );

    // 🔹 Remove user from all tasks assigned inside those projects
    await Task.updateMany(
      { project: { $in: await Project.find({ company: companyId }).distinct('_id') } },
      { $pull: { assignedTo: userId } }
    );

    // 🔹 Remove all the Notifications after user leaves the company
    await Notification.deleteMany({
      userId,
      companyId,
    });

    // Optionally, if you want to reattach updated company names:
    await attachCompanyNames(user.company);

    res.status(200).json({ message: "You have successfully left the company." });
  } catch (error) {
    console.error("Error leaving company:", error);
    next(error);
  }
};
