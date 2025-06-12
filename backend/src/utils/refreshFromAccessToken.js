import { attachCompanyNames } from "../utils/attachCompanyNames.js";
import generateAccessToken from "../utils/generateAccessToken.js";

import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// ⚠️ Always generate token using latest user.activeCompany, not decodedAccess
// we are allowing company/activeCompany to be null in case user just logged in and checkAuth ran
const refreshFromAccessToken = async (req, res, next, userFromToken = null) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Missing or invalid access token." });
    }

    const expiredAccessToken = authHeader.split(" ")[1];

    let decodedAccess;
    try {
      decodedAccess = jwt.verify(expiredAccessToken, process.env.JWT_SECRET, {
        ignoreExpiration: true,
      });
    } catch (err) {
      return res.status(401).json({ message: "Invalid access token." });
    }

    const { id } = decodedAccess;

    //Changed this Part
    // const user =
    //   userFromToken || await User.findById(id)
    //   .populate({
    //     path: "company.companyId",
    //     select: "name",
    //   })
    // if (!user) return res.status(401).json({ message: "User not found." });

    let user = userFromToken;

    if (user && !user.company[0]?.companyId?.name) {
      // Manually populate company names if not already populated
      user = await User.findById(user._id).populate(
        "company.companyId",
        "name"
      );
    } else if (!user) {
      user = await User.findById(id).populate("company.companyId", "name");
    }


    const activeEntry = user.company.find(
      (entry) => entry.companyId._id.equals(user.activeCompany) // Compare document's _id to activeCompany
    );

    console.log("active Entry :", activeEntry)

    // Generate token even if user has no active company (e.g just registered)
    const companyId = activeEntry?.companyId?._id || activeEntry?.companyId || null;
    const role = activeEntry?.role || null;
    const activeCompanyName = activeEntry?.companyId?.name || null;

    console.log("activeCompanyName:", activeCompanyName);

    const newAccessToken = generateAccessToken({
      id: user._id,
      companyId,
      role,
    });

    const updatedCompanies = await attachCompanyNames(user.company);

    return res.status(200).json({
      accessToken: newAccessToken,
      user: {
        _id: user._id,
        name: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        companies: updatedCompanies,
        activeCompany: user.activeCompany || null,
        activeCompanyName,
        companyId,
        role,
      },
    });
  } catch (error) {
    console.error("refreshFromAccessToken Error:", error);
    return next(error);
  }
};

export default refreshFromAccessToken;
