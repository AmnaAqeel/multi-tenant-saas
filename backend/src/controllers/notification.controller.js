import Notification from "../models/Notification.model.js";
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
  const { companyId } = req.user;  // Get the company ID from the user
  const { message } = req.body;  // The message content for the announcement

  if (!message) {
    return res.status(400).json({ message: "Announcement message is required." });
  }

  try {
    // Find all users in the company
    const users = await User.find({ "company.companyId": companyId });

    // Create and save notification for each user in the company
    for (const user of users) {
      const notification = new Notification({
        userId: user._id,
        message: `System Announcement: ${message}`,
        type: "system_announcement",
        companyId: companyId,
        read: false,
        createdBy: req.user._id,  // The admin who created the announcement
      });
      await notification.save();
    }

    res.status(200).json({ message: "System announcement created and notifications sent." });
  } catch (error) {
    console.error("Error creating system announcement:", error);
    next(error);
  }
};

// @route   GET /api/notifiactions/
// @desc    get all notifications (supports filtering)
// @access  Authorized only
export const getNotifications = async (req, res, next) => {
    try {
      const { companyId } = req.user; // Assuming companyId is in the accessToken
      const { type, status } = req.query;  // Capture query parameters
      const filter = { userId: req.user._id, companyId }; // Always filter by userId and companyId
  
      if (type) {
        filter.type = type;  // Filter by notification type (e.g., 'task_assigned', 'user_added_to_project')
      }
  
      if (status) {
        filter.read = status === 'unread';  // Filter by read/unread status
      }
  
      const notifications = await Notification.find(filter).sort({ createdAt: -1 });
      res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
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



