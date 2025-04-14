import Company from "../models/Company.model.js";
import cloudinary from "../config/cloudinary.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import { sendNotificationAndEmit } from "../utils/sendNotificationAndEmit.js"

//TODO: when a company is deleted remove that company from user company array

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

    let logoUrl;
    if (logo) {
      const uploadResponse = await cloudinary.uploader.upload(logo);
      logoUrl = uploadResponse.secure_url;
    }

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

    // 🔹 Update user: add company
    const user = await User.findById(createdBy);

    // Push new company with role
    user.company.push({ companyId: company._id, role: "admin" });

    // Only set activeCompany if it's null
    if (!user.activeCompany) {
      user.activeCompany = company._id;
    }

    await user.save();

    //When generating the new token, use the existing active company (not the one just created)
    //finding the Id(ObjectId) of the active company
    const activeCompanyEntry = user.company.find(
      (entry) => entry.companyId.toString() === user.activeCompany.toString()
    );

    // 🔹 Create new access token based on new activeCompany
    const accessToken = jwt.sign(
      {
        id: user._id,
        companyId: user.activeCompany,
        role: activeCompanyEntry?.role || "user", // fallback role
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(201).json({
      message: "Company created successfully",
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        companies: user.company,
        activeCompany: user.activeCompany,
        companyId: company._id,
        role: "admin",
      },
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

//TODO: Do you not think it should be coming from query params rather than body
// @route   PATCH /api/companies/switch
// @desc    switch company from list of companies, generate new accessToken and modify activeCompany
// @access  Authorized only
export const switchCompany = async (req, res, next) => {
  console.log(`req.user:`, req.user);
  console.log(`req.body:`, req.body);
  try {
    const userId = req.user._id;
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required." });
    }

    const user = await User.findById(userId);

    // Check if the user is a member of the target company
    // The method checks if at least one company in the user's company array matches the companyId provided in the request body.
    // “Loop through all companies this user belongs to, and find matching companyId.”
    const companyEntry = user.company.find(
      (entry) => entry.companyId.toString() === companyId
    );

    if (!companyEntry) {
      return res
        .status(403)
        .json({ message: "You are not part of this company." });
    }

    // Step 1: Update activeCompany
    user.activeCompany = companyId;
    await user.save();

    // Step 2: Generate new access token
    const accessToken = generateAccessToken({
      id: user._id,
      companyId: companyEntry.companyId,
      role: companyEntry.role,
    });

    // Step 3: Send it to frontend
    res.status(200).json({
      message: "Company switched successfully.",
      accessToken,
      company: {
        companyId: companyEntry.companyId,
        role: companyEntry.role,
      },
    });
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
export const getCompanyMembers = async (req, res) => {
  const { companyId } = req.user;

  try {
     // Check if company exists
     const company = await Company.findById(companyId);
     if (!company) {
       return res.status(404).json({ message: "Company not found." });
     }

    const users = await User.find({ "company.companyId": companyId }) //inside user doument, inside company array
      .select("name email company role") //specific fields to return
      .lean(); //converts the query result to a plain JavaScript object

      console.log(`users:`, users);

    const filteredUsers = users.map((user) => {
      const currentCompany = user.company.find(
        (c) => c.companyId.toString() === companyId.toString()
      );

      //processes each user to find the correct company in the company array and extracts the role for that specific company
      return {
        id: user._id,
        email: user.email,
        role: currentCompany?.role || "member",
      };
    });
    console.log(`filteredUsers:`, filteredUsers);

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

// @route   PATCH /api/companies/:id/members/:userId
// @desc    Change role of a member in a company
// @access  Private + Admin only
export const changeMemberRole = async (req, res) => {
  const { id: companyId, userId } = req.params;
  const { newRole } = req.body;

  if (!["admin", "editor", "member"].includes(newRole)) {
    return res.status(400).json({ message: "Invalid role provided." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const company = user.company.find(
      (c) => c.companyId.toString() === companyId
    );
    if (!company)
      return res
        .status(404)
        .json({ message: "Company not found for this user." });

    // If role is already the same, no update needed
    if (company.role === newRole) {
      return res.status(400).json({ message: "User already has this role." });
    }

    // Update role
    const oldRole = company.role;
    company.role = newRole;
    await user.save();

    // 1. Notify the user whose role was changed
    await sendNotificationAndEmit({
      userId: userId,
      message: `Your role has been changed from ${oldRole} to ${newRole} in the company.`,
      type: "role_changed",
      companyId: companyId,
      createdBy: req.user._id,
    })

    res.status(200).json({ message: "Role updated successfully." });
  } catch (error) {
    console.error("Error changing member role:", error);
    res.status(500).json({ message: "Server error while changing role." });
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
export const deleteCompany = async (req, res) => {
  const { id: companyId } = req.params;

  try {
    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // Delete the company document
    await Company.deleteOne({ _id: companyId });

    // Remove the company from all users who are part of it
    await User.updateMany(
      { "company.companyId": companyId },
      {
        $pull: {
          company: { companyId },
        },
        // Optional: Also reset activeCompany if it matches the deleted one
        $unset: {
          activeCompany: ""
        }
      }
    );

    res.status(200).json({ message: "Company deleted and references removed from users." });
  } catch (error) {
    console.error("Error deleting company:", error);
    next(error);
  }
};


// @route   POST /api/companies/:id/leave
// @desc    Leave a company
// @access  Private (any member)
export const leaveCompany = async (req, res) => {
  const { id: companyId } = req.params;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.company = user.company.filter(
      (c) => c.companyId.toString() !== companyId
    );

    if (user.activeCompany?.toString() === companyId.toString()) {
      user.activeCompany = null; // Optional: Reset active company
    }

    await user.save();

    res.status(200).json({ message: "You left the company." });
  } catch (error) {
    console.error("Error leaving company:", error);
    next(error);
  }
};
