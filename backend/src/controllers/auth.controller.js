import User from "../models/User.model.js";
import sendEmail from "../utils/sendEmail.js";
import generateAccessToken from "../utils/generateAccessToken.js";

import jwt from "jsonwebtoken";
import crypto from "crypto";


//wait just found, it sets company and role on login, in some cases, look upto it whats up
//Points to remember: when the user logs in the companyId and role against it is null
//this way he cant perform any action until its switched, maybe keep the lastActive companyID equal to companyId when he logsIn

// @route   POST /api/auth/register
// @desc    register a user, doesn't generate accessToken
// @access  public route
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
      // return res.status(400).json({ message: "Email already in use" });
      const error = new Error("Email already in use");
      error.statusCode = 400;
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

// @route   POST /api/auth/login
// @desc    login user, creates refreshToken and accessToken(containing all user companies)
// @access  public route
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      const error = new Error("All the fields are required");
      error.statusCode = 401;
      return next(error);
    }

    const user = await User.findOne({ email }).exec();
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      return next(error);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("Invalid Credentials");
      error.statusCode = 401;
      return next(error);
    }

    // 🔸 Initialize
    let companyEntry = null;
    let companyId = null;
    let role = null;

    if (user.activeCompany) {
      companyEntry = user.company.find(
        (each) => each.companyId.toString() === user.activeCompany.toString()
      );

      if (companyEntry) {
        companyId = companyEntry.companyId;
        role = companyEntry.role;
      }
    }
    const accessToken = generateAccessToken({
      id: user._id,
      role,
      companyId
    });

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Logged In successfully!",
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        companies: user.company,
        activeCompany: user.activeCompany,
        companyId,
        role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    next(error);
  }
};

// @route   POST /api/auth/logout
// @desc    clears refresh token(cookie - if have) and access token
// @access  public route
export const logoutUser = async (req, res, next) => {
  try {
    // 🔹 1. Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;

    // 🔹 2. Find user by refresh token
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });

      if (user) {
        user.refreshToken = null;
        user.refreshTokenExpires = null;
        await user.save();
      }
    }

    // 🔹 3. Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    // 🔹 4. Always respond with success, even if no token
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    next(error);
  }
};

// @route   POST /api/auth/refresh-token
// @desc    refresh user token, returns new access token, doesn't change the active company
// @access  public route
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
    let decodedRefresh;
    try {
      decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
      console.log(`decodedRefresh:`, decodedRefresh);
    } catch (err) {
      const error = new Error("Invalid or expired refresh token.");
      error.status = 401;
      return next(error);
    }

    // 🔹 4. Check if user exists and refresh token is not expired
    const user = await User.findById(decodedRefresh.id);
    console.log(`user:`, user);

    const tokensMatch = user?.refreshToken?.trim() === refreshToken?.trim();
    const tokenExpired = user?.refreshTokenExpires < Date.now();

    if (
      !user ||
      !user.refreshToken ||
      !user.refreshTokenExpires ||
      !tokensMatch ||
      tokenExpired
    ) {
      if (user) {
        user.refreshToken = null;
        user.refreshTokenExpires = null;
        await user.save();
      }

      const error = new Error("Session expired. Please log in again.");
      error.status = 401;
      return next(error);
    }

    // 🔹 4. Decode the original access token (expired one) from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Missing access token.");
      error.status = 401;
      return next(error);
    }

    const expiredAccessToken = authHeader.split(" ")[1];
    console.log(`expiredAccessToken: ${expiredAccessToken}`);

    // Use ignoreExpiration to decode it even if expired
    let decodedAccess;
    try {
      decodedAccess = jwt.verify(expiredAccessToken, process.env.JWT_SECRET, {
        ignoreExpiration: true,
      });
      console.log("decodedAccess");
      // console.log(decodedAccess)
    } catch (err) {
      const error = new Error("Invalid access token.");
      error.status = 401;
      return next(error);
    }

    const { companyId, role } = decodedAccess;

    // 🔹 5. Generate new access token with same context
    const accessToken = generateAccessToken({
      id: user._id,
      companyId,
      role
    });

    // 🔹 6. Send new access token in response
    res.status(200).json({
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        companies: user.company,
        activeCompany: user.activeCompany,
        companyId,
        role,
      },
    });
  } catch (error) {
    console.error("refreshUserToken Error:", error);
    next(error);
  }
};

// @route   POST /api/auth/forgot-password
// @desc    create a link, send email containing the link for reset password
// @access  public route
export const forgotPassword = async (req, res, next) => {
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
      message: "Email sent. Check inbox",
      resetUrl,
    });
  } catch (error) {
    console.error("forotPassword Error:", error);
    next(error);
  }
};

// @route   POST /api/auth/reset-password
// @desc    user will click the link and bring token to reset password
// @access  public route
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
      error.status = 400;
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
