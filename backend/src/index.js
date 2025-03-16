import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";

import {connectDB} from "./config/db.js";

//Routes
import authRoutes from "./routes/auth.route.js";
import tenantRoutes from "./routes/tenant.route.js";

import { errorHandler } from "./middlewares/errorHandler.middlware.js";

const PORT = process.env.PORT || 5000;

const app = express();
dotenv.config();

// ✅ Middlewares
app.use(express.json()); // Body Parser
app.use(cookieParser()); // Cookie Parser
app.use(cors()); // CORS
app.use(helmet()); // Security Headers
app.use(morgan("dev")); // Logger
app.use(compression()); // Response Compression

// ✅ Routes
app.use("/api/auth", authRoutes)
app.use("/api/tenants", tenantRoutes)

// ✅ Global error handler at the BOTTOM
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  connectDB();
});
