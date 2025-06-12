import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";

//Routes
import authRoutes from "./routes/auth.route.js";
import companyRoutes from "./routes/company.route.js";
import inviteRoutes from "./routes/invite.route.js";
import projectRoutes from "./routes/project.route.js"
import notificationRoutes from "./routes/notification.route.js"

import { errorHandler } from "./middlewares/errorHandler.middlware.js";
import { allowedOrigins } from "./config/cors.js";

const app = express();

//  Middlewares
app.use(express.json({ limit: "10mb" })); // Body Parser
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser()); // Cookie Parser
app.use(helmet()); // Security Headers
app.use(morgan("dev")); // Logger
app.use(compression()); // Response Compression

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  exposedHeaders: ["Authorization"],
  allowedHeaders: ["Content-Type", "Authorization"] //  Required!
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notifications", notificationRoutes);

// Global error handler
app.use(errorHandler);

export default app;
