import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("🔑 JWT Token:", token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔓 Decoded token:", decoded);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach all required values
    req.user = {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: decoded.role, // comes from token
      companyId: decoded.companyId, // comes from token
    };

    console.log("👤 Authenticated user:", req.user);

    next();
  } catch (error) {
    console.error("Auth Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "jwt expired" }); //  Now interceptor can catch
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
