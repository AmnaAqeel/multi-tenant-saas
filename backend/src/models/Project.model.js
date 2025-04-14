// models/Project.js
import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
    },
    teamMembers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        role: {
          type: String,
          enum: [
            "project-manager",
            "designer",
            "developer",
            "qa",
            "business-analyst",
            "devops",
            "product-owner",
            "scrum-master"
          ],
          default: "developer",
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: true,
    },
    status: {
      type: String,
      enum: ["not-started", "on-hold", "in-progress", "cancelled", "completed", "archived"],
      default: "in progress",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    dueDate: {
      type: Date, // Date field
      default: null, // Default to null
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", ProjectSchema);
