import express from "express";

//Middlewares
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

//Controllers
// import { getTenant, updateTenant } from "../controllers/tenant.controller.js";

const router = express.Router();

// router.get("/", [authMiddleware, roleMiddleware("Admin")], getTenants);
// router.post("/register", [authMiddleware, roleMiddleware("Admin")], registerTenant);
// router.post("/:id", [authMiddleware, roleMiddleware("Admin")], registerTenant);


export default router;
