import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import { findByEmail } from "../models/User.js";

const companyEmails = [
  "akorganicsfoodpvtltd@gmail.com",
  "akoranicsfoodpvtltd@gmail.com"
];

const determineRole = (email) => {
  const normalized = email.toLowerCase().trim();
  return companyEmails.includes(normalized) ? "admin" : "user";
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await findByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const userRole = determineRole(user.email);
    const isCompanyEmail = userRole === "admin";

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: userRole,
        name: `${user.first_name} ${user.last_name}`.trim(),
        isCompanyEmail
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none"
    });

    res.cookie("user_session", "active", {
      httpOnly: false,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none"
    });

    const userData = {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      firstName: user.first_name,
      lastName: user.last_name,
      role: userRole,
      isCompanyEmail
    };

    res.json({
      success: true,
      message: "Login successful",
      token, // ✅ send token in response body too
      user: userData,
      redirectTo: isCompanyEmail ? "/admin/dashboard" : null
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Login failed", error: err.message });
  }
};

// LOGOUT
export const logout = (req, res) => {
  try {
    res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "none" });
    res.clearCookie("user_session", { httpOnly: false, secure: true, sameSite: "none" });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ success: false, message: "Logout failed", error: err.message });
  }
};

// GET CURRENT USER — ✅ reads cookie OR Authorization header
export const getMe = async (req, res) => {
  try {
    // ✅ Check cookie first, then Authorization header (for localStorage token)
    let token = req.cookies?.jwt;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // For Google users, they may not exist in DB — use token data directly
    let userData;
    const user = await findByEmail(decoded.email);

    if (user) {
      const userRole = determineRole(user.email);
      const isCompanyEmail = userRole === "admin";
      userData = {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`.trim(),
        firstName: user.first_name,
        lastName: user.last_name,
        role: userRole,
        isCompanyEmail
      };
    } else {
      // ✅ Google user not in DB — use decoded token data
      userData = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        loginMethod: decoded.loginMethod || "google"
      };
    }

    res.json({ success: true, user: userData });

  } catch (err) {
    console.error("GetMe error:", err);
    res.clearCookie("jwt");
    res.clearCookie("user_session");
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
      [firstName, lastName, normalizedEmail, hashedPassword]
    );

    const userRole = determineRole(normalizedEmail);
    const isCompanyEmail = userRole === "admin";

    const token = jwt.sign(
      {
        id: result.insertId,
        email: normalizedEmail,
        role: userRole,
        name: `${firstName} ${lastName}`.trim(),
        isCompanyEmail
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none"
    });

    res.cookie("user_session", "active", {
      httpOnly: false,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none"
    });

    res.status(201).json({
      success: true,
      message: "Signup successful",
      token, // ✅ send token in body too
      user: {
        id: result.insertId,
        first_name: firstName,
        last_name: lastName,
        email: normalizedEmail,
        role: userRole,
        isCompanyEmail
      },
      redirectTo: isCompanyEmail ? "/admin/dashboard" : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Signup failed", error: err.message });
  }
};
