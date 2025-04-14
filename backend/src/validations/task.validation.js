import { body } from "express-validator";

export const createTaskValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ max: 100 })
    .withMessage("Title must be under 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be under 500 characters"),

  body("assignedTo")
    .optional()
    .isArray()
    .withMessage("Assigned users must be an array")
    .custom((users) => {
      for (const user of users) {
        if (!user.userId) {
          throw new Error("Each assigned user must have a userId");
        }
      }
      return true;
    }),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Priority must be one of: low, medium, high, urgent"),

  body("status")
    .optional()
    .isIn(["to-do", "in-progress", "completed"])
    .withMessage("Status must be one of: to-do, in-progress, completed"),

  body("comments")
    .optional()
    .isArray()
    .withMessage("Comments must be an array")
    .custom((comments) => {
      for (const comment of comments) {
        if (!comment.user || !comment.text) {
          throw new Error("Each comment must have a user and text");
        }
      }
      return true;
    }),
];
