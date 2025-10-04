// src/utils/jwt.js
import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "dev_secret";

export const signToken = (payload, expiresIn = "7d") =>
  jwt.sign(payload, SECRET, { expiresIn });

export const verifyToken = (token) => jwt.verify(token, SECRET);
