// 📌 validations/projectValidation.js
import { body } from "express-validator";

export const createProjectValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Project title is required")
    .isLength({ max: 100 })
    .withMessage("Title must be under 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be under 500 characters"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Priority must be one of: low, medium, high, urgent"),

  body("status")
    .optional()
    .isIn( ["not-started", "on-hold", "in-progress", "cancelled", "completed", "archived"])
    .withMessage("Status must be one of: in progress, completed, cancelled, on hold, not started, archived"),

  body("teamMembers")
    .optional()
    .isArray()
    .withMessage("Team members must be an array")
    .custom((members) => {
      for (const member of members) {
        if (!member.userId || !member.role) {
          throw new Error("Each team member must have a userId and role");
        }
      }
      return true;
    }),

  body("company")
    .optional() // You’ll get companyId from `req.user.companyId` anyway
    .isMongoId()
    .withMessage("Invalid company ID format"),
];
