import express from "express";

//Middlewares
import {validateInput} from "../middlewares/ValidateInput.middleware.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";
import {rateLimiterMiddleware} from "../middlewares/rateLimiter.middleware.js";
import {registerValidation, loginValidation, resetPasswordValidation, forgotPasswordValidation} from "../validations/auth.validation.js";

//Controllers
import { registerUser, loginUser, logoutUser, refreshUserToken, resetUserPassword, forgotPassword, updateProfile } from "../controllers/auth.controller.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/", [rateLimiterMiddleware, validateInput(registerValidation)], registerUser);
router.post("/login", [rateLimiterMiddleware, validateInput(loginValidation)], loginUser);

// Protected routes (authentication required)
router.get("/protected", authMiddleware, (req, res) => {
    res.json({ message: "This is a protected route" });
  });
 
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshUserToken);
router.post("/forgot-password", [rateLimiterMiddleware, validateInput(forgotPasswordValidation)], forgotPassword);
router.patch("/reset-password", [ rateLimiterMiddleware, validateInput(resetPasswordValidation)], resetUserPassword);
router.put("/update-profile", authMiddleware, updateProfile);


export default router;
