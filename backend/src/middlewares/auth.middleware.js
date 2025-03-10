import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const authMiddleware = async (req, res, next) => {
  console.log(`printing req.header from auth middleware: ${req.header}`);
  console.log(`printing Authorzation alone: ${req.header("Authorization")}`);
  console.log(
    `printing after split now: ${req.header("Authorization")?.split(" ")[1]}`
  );
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth Error:", error); // Log error for debugging
    next(error); // 🔥 Pass error to the global error handler
  }
};
