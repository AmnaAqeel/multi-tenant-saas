import User from "../models/User.model.js";
import sendEmail  from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const registerUser = async (req, res, next) => {
  const { fullName, email, password } = req.body;
  try {
    // 🔹 Check if all fields are provided
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔹 Check if user already exists
    const existingUser = await User.findOne({ email });
    console.log(existingUser);
    if (existingUser) {
      const error = new Error("Email already in use");
      error.status = 400;
      return next(error); //  Pass to error handler
    }

    // 🔹 Create new user
    const newUser = new User({ fullName, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.log("Register Error:", error);
    if (error.name === "ValidationError") {
      //  Catch Mongoose validation errors
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors }); // ✅ Send validation errors properly
    }

    next(error); //  Pass unexpected errors to global error handler
  } // 
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(`req.body: ${req.body}`)

  try {
    //check if all fields are provided
    if (!email || !password) {
      const error = new Error("All the fields are required");
      error.statusCode = 401;
      return next(error); //  Pass to error handler
    }

    //check if user exists
    const user = await User.findOne({ email }).exec();
    console.log(`user: ${user}`)
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      return next(error); //  Pass to error handler
    }

    // 🔹 Compare Entered Password with Hashed Password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("Invalid Credentials");
      error.statusCode = 401;
      return next(error); //  Pass to error handler
    }

    // Generate Access & Refresh Tokens
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Store Refresh Token in DB
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Expires in 7 days

    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: "Logged In successfully!", accessToken });

    
  } catch (error) {
    console.error("Login Error:", error);
    next(error);
  }
};
export const logoutUser = async (req, res, next) => {
  try {
    // 🔹 1. Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: "Already logged out" }); // No token means already logged out
    }

    // 🔹 2. Find user by refresh token
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null; // Remove the refresh token from the database
      user.refreshTokenExpires = null;
      await user.save();
    }

    // 🔹 3. Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    // 🔹 4. Send success response
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    next(error);
  }
};
export const refreshUserToken = async (req, res, next) => {
  try {
    // 🔹 1. Extract refresh token from cookies
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      const error = new Error("Unauthorized. Please log in again.");
      error.status = 401;
      return next(error);
    }

    // 🔹 2. Verify refresh token with JWT
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    if (!decoded) {
      const error = new Error("Unauthorized. Please log in again.");
      error.status = 401;
      return next(error);
    }

    // 🔹 3. Check if refresh token exists in the database
    const user  = await User.findOne({ refreshToken });
    if (!user) {
      const error = new Error("Invalid session. Please log in again.");
      error.status = 401;
      return next(error);
    }

    // 🔹 4. Check if refresh token is expired
    console.log(`refreshToken: ${user.refreshToken}`)
    console.log(`user.refreshTokenExpires < Date.now(): ${user.refreshTokenExpires < Date.now()}`)
    if (user.refreshTokenExpires < Date.now()) {
      user.refreshToken = null; // Clear expired token
      user.refreshTokenExpires = null;
      await user.save();
      const error = new Error("Invalid session. Please log in again.");
      error.status = 401;
      return next(error);
    }

    // 🔹 5. Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).json({ message: "Password reset successfully" }, { accessToken: newAccessToken });
    // res.json({ accessToken: newAccessToken }); //Send new access token
  } catch (error) {
    console.error("refreshUserToken Error:", error);
    next(error);
  }
};
export const forgotPassword = async (req, res,next) => {
  const { email } = req.body;
  try {
    if (!email) {
      const error = new Error("Email is required");
      error.statusCode = 401;
      return next(error); //  Pass to error handler
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    // 🔹 Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 60 * 60 * 1000; // Expires in 1 hour
    await user.save();

    //  🔹 Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
 
    await sendEmail(
      user.email,
      "Password Reset",
      `Click here to reset your password: ${resetUrl}`
    );

    // ✅ Send success response
    res.status(200).json({
      message: "Email sent. Check inbox", resetUrl
    });
  } catch (error) {
    console.error("forotPassword Error:", error);
    next(error);
  }
};

export const resetUserPassword = async (req, res, next) => {
  try {
    const { token } = req.query; // Extract token from URL
    const { newPassword } = req.body;

    //check if neccassory fields are available
    if (!token || !newPassword) {
        const error = new Error("All the fields are required");
        error.statusCode = 401;
        return next(error); //  Pass to error handler
    }

    //Find the user with all the checks
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error("Invalid or expired reset token");
      error.status =  400;
      return next(error);
    }

    // 🔹 Hash new password and update user
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("resetPassword Error:", error);
    next(error);
  }
};
