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
    .isIn(["1-10", "11-50", "51-200", "201-500", "500+"])
    .withMessage("Employees must be a valid range."),  

  body("logo")
  .optional({ nullable: true }) // allows null too
    .isString()
    .withMessage("Logo must be a string"),
];
