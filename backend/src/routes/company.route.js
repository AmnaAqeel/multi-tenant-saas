import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {roleMiddleware} from "../middlewares/role.middleware.js";
import {
  createCompany,
  getUserCompanies,
  switchCompany,
  getCompanyById,
  getCompanyMembers,
  removeMember,
  changeMemberRole,
  updateCompany,
  deleteCompany,
  leaveCompany
} from "../controllers/company.controller.js";
import { validateInput } from "../middlewares/ValidateInput.middleware.js";
import { createCompanyValidation } from "../validations/company.validation.js";

const router = express.Router();

//Core Company Routes
router.post("/", authMiddleware, validateInput(createCompanyValidation), createCompany);
router.get("/my", authMiddleware, getUserCompanies);
router.patch("/switch", authMiddleware, switchCompany);
router.get("/:id", authMiddleware, roleMiddleware("admin"), getCompanyById);

//  Essential basic team management Routes
router.get("/:id/members", authMiddleware, roleMiddleware("admin"), getCompanyMembers);
router.delete("/:id/members/:userId",authMiddleware,roleMiddleware("admin"),removeMember);

//Deep Company Management and Role Handling routes
router.patch("/:id/members/:userId",authMiddleware,roleMiddleware("admin"),changeMemberRole);
router.patch("/:id", authMiddleware, roleMiddleware("admin"), updateCompany);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteCompany);
router.post("/:id/leave", authMiddleware, leaveCompany);



export default router;
