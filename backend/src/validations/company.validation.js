// 📌 validations/companyValidation.js
import { body } from "express-validator";

export const createCompanyValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ max: 100 })
    .withMessage("Company name must be under 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be under 500 characters"),

  body("website")
    .optional()
    .trim()
    .matches(/^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,}(\/\S*)?$/i)
    .withMessage("Invalid website URL format"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Location must be under 100 characters"),

  body("employees")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Employees must be a positive number"),

  body("logo")
    .optional()
    .isString()
    .withMessage("Logo must be a string"),
];
