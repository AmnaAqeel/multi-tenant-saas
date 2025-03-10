import express from "express";

//Middlewares
import {validateInput} from "../middlewares/ValidateInput.middleware.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";
import {rateLimiterMiddleware} from "../middlewares/rateLimiter.middleware.js";
import {registerValidation, loginValidation, resetPasswordValidation, forgotPasswordValidation} from "../validations/authValidation.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

//Controllers
import { registerUser, loginUser, logoutUser, refreshUserToken, resetUserPassword, forgotPassword } from "../controllers/auth.controller.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", [rateLimiterMiddleware, validateInput(registerValidation)], registerUser);
router.post("/login", [rateLimiterMiddleware, validateInput(loginValidation)], loginUser);

// Protected routes (authentication required)
router.post("/logout", [authMiddleware], logoutUser);
router.post("/refresh-token", [authMiddleware], refreshUserToken);
router.post("/forgot-password", [rateLimiterMiddleware, validateInput(forgotPasswordValidation)], forgotPassword);
router.patch("/reset-password", [authMiddleware, rateLimiterMiddleware, validateInput(resetPasswordValidation)], resetUserPassword);

export default router;
