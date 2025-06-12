import { v4 as uuidv4 } from "uuid";

import User from "../models/User.model.js";
import Invite from "../models/Invite.model.js";

import sendEmail from "../utils/sendEmail.js";
import {sendNotificationAndEmit} from "../utils/sendNotificationAndEmit.js"

//TODO: While sending invite check if user is already a part of company
//Optional: Make an Invites page or something for admin, currently he could not view the invites or del them

// @route   POST /api/invites/
// @desc    generate uuid, store it in DB, send invite(link) thru email
// @access  Admin only
export const sendInvite = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const companyId = req.user.companyId;
    const adminId = req.user._id;

    console.log(`req.body:`, req.body);
    console.log(`req.user:`, req.user);

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required." });
    }

    //  Check for existing pending invite first
    const existingInvite = await Invite.findOne({
      email,
      companyId,
      status: "pending",
    });

    if (existingInvite) {
      return res
        .status(400)
        .json({ message: "An invite has already been sent to this email." });
    }

    ///  Check if user exists AND is already in the company
    const user = await User.findOne({ email });

    if (
      user &&
      user.company.some((c) => c.companyId.toString() === companyId.toString())
    ) {
      return res
        .status(400)
        .json({ message: "User is already a member of your company." });
    }

    //Generate token and its expiry date
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    //save in database
    const newInvite = await Invite.create({
      email,
      companyId,
      role,
      token,
      invitedBy: adminId,
      expiresAt,
      status: "pending",
    });
    await newInvite.save();

    //send mail to user
    const invitation = `${process.env.FRONTEND_URL}/company-invite/${token}`;
    await sendEmail(
      email,
      "You're Invited to Join a Company",
      `You’ve been invited to join a company on MultiTenant SaaS Dashboard.
    
    Click the link below to accept the invitation:
    ${invitation}
    
    This invite will expire in 7 days.
    
    If you weren’t expecting this, feel free to ignore it.`
    );

    res.status(201).json({
      message: "Invitation sent successfully.",
      invite: {
        email,
        role,
        token,
        expiresAt,
        invitation,
      },
    });
  } catch (error) {
    console.error("Error sending invite:", error);
    next(error);
  }
};

// @route   GET /api/invites/sent
// @desc    fetch all the invites sent for a company thru companyId
// @access  Admin only
export const getSentInvites = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const invites = await Invite.find({ companyId }).sort({
      createdAt: -1,
    })
    .populate("invitedBy", "fullName email profilePicture");

    res.status(200).json({ invites });
  } catch (error) {
    console.error("Error fetching sent invites:", error);
    res.status(500).json({ message: "Failed to fetch invites." });
  }
};

// @route   DELETE /api/invites/:inviteId
// @desc    Revoke/Delete an invite thru inviteId
// @access  Admin only
export const revokeInvite = async (req, res) => {
  const { inviteId } = req.params;
  const companyId = req.user.companyId;

  const invite = await Invite.findById(inviteId);

  if (!invite) {
    return res.status(404).json({ message: "Invite not found." });
  }

  // Make sure the invite belongs to the admin's company
  if (invite.companyId.toString() !== companyId.toString()) {
    return res
      .status(403)
      .json({ message: "You are not authorized to revoke this invite." });
  }

  // Only revoke if it's still pending
  if (invite.status !== "pending") {
    return res
      .status(400)
      .json({ message: "Only pending invites can be revoked." });
  }

  await invite.deleteOne();

  return res.status(200).json({ message: "Invite revoked successfully." });
};

/* 
🛠 UI Flow
1️  User clicks the invite link → Calls GET /api/invites/:token
 Backend returns company & invite details.
 Frontend displays company info and a "Join" button.

2️  User clicks "Join" → Calls POST /api/invites/:token/join
 Backend validates & adds the user.
 New access token is issued.
 User is redirected to their new company dashboard.
*/


// @route   GET /api/invites/:token
// @desc    for previewing the invite (Only validate and fetch details, don't add the user).
// @access  anyone [public route]
export const validateInviteToken = async (req, res) => {
  const { token } = req.params;

  try {
    //Find the invite using the token and status
    // Replace the IDs (invitedBy and companyId) with the actual documents
    const invite = await Invite.findOne({ token, status: "pending" })
    .populate("invitedBy", "name email")
    .populate("companyId", "projects")
    .populate({
      path: "companyId",
      populate: {
        path: "projects",
        select: "title description status teamMembers",
      },
    })
    .populate({
      path: "companyId",
      populate: {
        path: "projects",
        match: { isArchived: false },
        populate: {
          path: "teamMembers.user",
          select: "fullName email profilePicture",
        },
      },
      
    });  

    if (!invite) {
      return res
        .status(404)
        .json({ message: "Invite not found or already used." });
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Invite has expired." });
    }

    res.status(200).json({
      message: "Invite is valid.",
      invite: {
        email: invite.email,
        role: invite.role,
        invitedBy: invite.invitedBy,
        company: invite.companyId,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (err) {
    console.error("Error validating invite token:", err);
    res.status(500).json({ message: "Server error while validating invite." });
  }
};

// @route   POST /api/invites/:token/join
// @desc     only validate the invite at this step and then add the user when they click "Join"
// @access  Authorized only
export const joinCompany = async (req, res) => {
  const { token } = req.params;
  const userId = req.user._id; // From auth middleware

  try {
    const invite = await Invite.findOne({ token, status: "pending" });
    if (!invite) {
      return res
        .status(404)
        .json({ message: "Invite not found or already used." });
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Invite has expired." });
    }

    const user = await User.findById(userId);
    const alreadyInCompany = user.company.some(
      (c) => c.companyId.toString() === invite.companyId.toString()
    );

    if (alreadyInCompany) {
      return res
        .status(400)
        .json({ message: "You are already in this company." });
    }

    // Add company and role to user
    user.company.push({
      companyId: invite.companyId,
      role: invite.role,
    });
    
    console.log("attaching user's active Company")
    user.activeCompany = invite.companyId;

    console.log("user.activeCompany", user.activeCompany)

    // Applied fix here
    // // Set activeCompany ONLY if user doesn't already have one
    // if (!user.activeCompany) {
    //   user.activeCompany = invite.companyId;
    // }

    await user.save();

    // Mark invite as accepted
    invite.status = "accepted";
    await invite.save();

    const joiningUserName = user.fullName;

    // Notify admin
    await sendNotificationAndEmit({
      userId: invite.invitedBy,
      message: `${joiningUserName} accepted your invite to join the company.`,
      type: "invite_accepted",
      companyId: invite.companyId,
      createdBy: user._id,
    });

    // Notify others in same company
    const companyUsers = await User.find({ "company.companyId": invite.companyId });
    for (const companyUser of companyUsers) {
      if (companyUser._id.toString() !== user._id.toString()) {
        await sendNotificationAndEmit({
          userId: companyUser._id,
          message: `${joiningUserName} joined the company.`,
          type: "user_joined",
          companyId: invite.companyId,
          createdBy: user._id,
        });
      }
    }

    console.log("user :", user)

    res.status(200).json({
      message: "Company joined successfully.",
    });
  } catch (err) {
    console.error("Error joining company:", err);
    res.status(500).json({ message: "Server error while joining company." });
  }
};
