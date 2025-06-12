import Notification from "../models/Notification.model.js";
import mongoose from "mongoose";
import User from "../models/User.model.js";


// @route   POST /api/notifiactions/announcement
// @desc    generate a notification
// @access  Authorized only
export const createNotification = async (req, res, next) => {
  try {
    const { userId, message, type, companyId, createdBy } = req.body;

    // Check if the necessary fields are provided
    if (!userId || !message || !type || !companyId, !createdBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create a new notification
    const newNotification = new Notification({
      userId,
      message,
      type,
      companyId,
      createdBy,
    });

    await newNotification.save();

    res.status(201).json({
      message: "Notification created successfully",
      notification: newNotification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    next(error);
  }
};

// @route   POST /api/notifiactions/
// @desc    generate a company wide notification for all members
// @access  Admin only
export const createSystemAnnouncement = async (req, res, next) => {
  const { companyId } = req.user;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Announcement message is required." });
  }

  try {
    const users = await User.find({ "company.companyId": companyId });

    let adminNotification = null;

    for (const user of users) {
      const notification = new Notification({
        userId: user._id,
        message,
        type: "system_announcement",
        companyId,
        read: false,
        createdBy: req.user._id,
      });

      const saved = await notification.save();

      // Save admin's version to send back
      if (user._id.toString() === req.user._id.toString()) {
        adminNotification = saved;
      }
    }

    return res.status(200).json(adminNotification); // return the full object
  } catch (error) {
    console.error("Error creating system announcement:", error);
    next(error);
  }
};


// @route   GET /api/notifiactions/
// @desc    fetch system Notf for evreyone
// @access  everyone
export const getSystemAnnouncements = async (req, res) => {
  const { _id: userId, companyId } = req.user;
  try {
    const announcements = await Notification.find({
      type: 'system_announcement',
      userId,
      companyId,
    }).sort({ createdAt: -1 });

    res.status(200).json(announcements);
  } catch (err) {
    console.error("Failed to fetch announcements:", err);
    res.status(500).json({ error: 'Failed to fetch system announcements' });
  }
};


// @route   GET /api/notifiactions/
// @desc    get all notifications (supports filtering)
// @access  Authorized only
export const getNotifications = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { type } = req.query;

    const filter = {
      companyId,
      ...(type && { type }),
    };

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching company notifications:", error);
    next(error);
  }
  };

// @route   GET /api/notifiactions/project/:projectId
// @desc    get all notifications for a project
// @access  Authorized only
export const getProjectNotificationsByProject = async (req, res, next) => {
  console.log("Notification with projectId was hit");
  
  try {
    const {  companyId: {_id: companyId},  _id: userId } = req.user;
    const { projectId } = req.params;

    const notifications = await Notification.find({
      userId,
      companyId,
      projectId: new mongoose.Types.ObjectId(projectId), // handle ObjectId match
    }).sort({ createdAt: -1 });

    console.log("returning: ", notifications)
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching project notifications:", error);
    next(error);
  }
};
  
// @route   PATCH /api/notifications/:id/read
// @desc    get all notifications (supports filtering)
// @access  Authorized only
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const notificationId = req.params.id;

    // Find the notification by ID and mark it as read
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure that only the owner of the notification can mark it as read
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (notification.read) {
      return res.status(400).json({ message: "Notification already marked as read" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    next(error);
  }
};

// @route   PATCH /api/notifications/mark-all-read
// @desc    mark all the notifications as read
// @access  Authorized only
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Update all unread notifications for the user
    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    next(error);
  }
};


// @route   DELETE /api/notifications/:id
// @desc    get all notifications (supports filtering)
// @access  Authorized only
export const deleteNotification = async (req, res, next) => {
  try {
    const notificationId = req.params.id;

    // Find the notification by ID and delete it
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure that only the owner of the notification can delete it
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    //  delete from the DB
    await Notification.deleteOne({ _id: notificationId });

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    next(error);
  }
};



