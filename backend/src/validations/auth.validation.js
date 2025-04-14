import { body } from "express-validator";

// 📌 Registration Validation
export const registerValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required").matches(/^[a-zA-Z\s]+$/).withMessage("Full name must contain only letters and spaces"),,
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain a special character")
    .not()
    .matches(/\s/)
    .withMessage("Password cannot contain spaces"),
];

// 📌 Login Validation
export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password").notEmpty().withMessage("Password is required"),
];

// 📌 forgot-password Validation
export const forgotPasswordValidation = [
  body("email")
  .trim()
  .notEmpty()
  .withMessage("Email is required")
  .bail() //  Stop validation if empty
  .isEmail()
  .withMessage("Invalid email format"),
];

// 📌 Reset-password Validation
export const resetPasswordValidation = [
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain a special character")
    .not()
    .matches(/\s/)
    .withMessage("Password cannot contain spaces"),
];

