import jwt from "jsonwebtoken";
import { findByEmail } from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // Check cookie first, then Authorization header
    let token = req.cookies?.jwt;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find user in DB
    const user = await findByEmail(decoded.email);

    if (user) {
      req.user = user;
    } else {
      // Google users may not be in DB — use token data directly
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        loginMethod: decoded.loginMethod || "google"
      };
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid" });
  }
};
