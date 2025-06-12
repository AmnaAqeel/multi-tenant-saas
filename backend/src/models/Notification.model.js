import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // Refers to the user receiving the notification
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company", // Refers to the company where the user joined
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // Refers to the project where the user joined
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "user_joined",
        "invite_accepted",
        "task_assigned",
        "new_comment",
        "project_assigned",
        "task_status_changed",
        "project_status_changed",
        "project_restored",
        "role_changed",
        "system_announcement", // Admins can send system-wide notifications
      ],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // The admin or system who created the notification
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
