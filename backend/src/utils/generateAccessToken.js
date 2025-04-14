// File: utils/generateAccessToken.js

import jwt from "jsonwebtoken";

const generateAccessToken = ({ id, role, companyId }) => {
  return jwt.sign(
    { id, role, companyId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

export default generateAccessToken;
