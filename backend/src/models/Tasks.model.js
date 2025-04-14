import mongoose from "mongoose";
// Comment Schema
const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }
);

// Subtask Schema
const SubtaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["to-do", "completed"], 
      default: "to-do" 
    },
  }
);

// Task Schema
const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user"
        }
      }
    ],
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["to-do", "in-progress", "completed"],
      default: "to-do",
    },
    comments: [CommentSchema], // Embedding Comment Schema
    subtasks: [SubtaskSchema], // Embedding Subtask Schema
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Task", TaskSchema);
