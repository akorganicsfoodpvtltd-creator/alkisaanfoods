import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import { findByEmail } from "../models/User.js";

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for:", email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide email and password" 
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    const user = await findByEmail(normalizedEmail);
    if (!user) {
      console.log("User not found:", normalizedEmail);
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    console.log("User found:", user.email);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for:", normalizedEmail);
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    console.log("Password matched for:", normalizedEmail);

    // DETERMINE USER ROLE - FIXED: Always check for company emails
    const companyEmails = [
      "akorganicsfoodpvtltd@gmail.com",
      "akoranicsfoodpvtltd@gmail.com"
    ];
    
    const userEmail = user.email.toLowerCase().trim();
    const isCompanyEmail = companyEmails.includes(userEmail);
    const userRole = isCompanyEmail ? "admin" : "user";
    
    console.log(`Role determined for ${userEmail}: ${userRole} (Company email: ${isCompanyEmail})`);

    // Create token with user info
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: userRole,
        name: `${user.first_name} ${user.last_name}`.trim(),
        isCompanyEmail: isCompanyEmail
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "3d" }
    );

    // Set cookie
    res.cookie("jwt", token, { 
      httpOnly: true, 
      maxAge: 3 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Also set a simple session cookie for frontend detection
    res.cookie("user_session", "active", {
      httpOnly: false,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      firstName: user.first_name,
      lastName: user.last_name,
      role: userRole,
      isCompanyEmail: isCompanyEmail
    };

    console.log(`Login successful for: ${user.email}, Role: ${userRole}, Company Email: ${isCompanyEmail}`);

    res.json({ 
      success: true,
      message: "Login successful",
      user: userData,
      redirectTo: isCompanyEmail ? "/admin/dashboard" : null
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false,
      message: "Login failed", 
      error: err.message 
    });
  }
};

// LOGOUT
export const logout = (req, res) => {
  try {
    // Clear all auth cookies
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.clearCookie("user_session", {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({ 
      success: true,
      message: "Logged out successfully" 
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ 
      success: false,
      message: "Logout failed", 
      error: err.message 
    });
  }
};

// GET CURRENT USER
export const getMe = async (req, res) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Not authenticated" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get fresh user data from database
    const user = await findByEmail(decoded.email);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Determine role based on email - FIXED: Always check company emails
    const companyEmails = [
      "akorganicsfoodpvtltd@gmail.com",
      "akoranicsfoodpvtltd@gmail.com"
    ];
    
    const userEmail = user.email.toLowerCase().trim();
    const isCompanyEmail = companyEmails.includes(userEmail);
    const userRole = isCompanyEmail ? "admin" : "user";

    const userData = {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      firstName: user.first_name,
      lastName: user.last_name,
      role: userRole,
      isCompanyEmail: isCompanyEmail
    };

    res.json({ 
      success: true,
      user: userData 
    });

  } catch (err) {
    console.error("GetMe error:", err);
    
    // Clear invalid token
    res.clearCookie("jwt");
    res.clearCookie("user_session");
    
    return res.status(401).json({ 
      success: false,
      message: "Invalid or expired token" 
    });
  }
};

// SIGNUP (if needed)
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    const existingUser = await findByEmail(normalizedEmail);
    if (existingUser) return res.status(400).json({ 
      success: false,
      message: "Email already exists" 
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
      [firstName, lastName, normalizedEmail, hashedPassword]
    );

    // Determine role based on email - FIXED
    const companyEmails = [
      "akorganicsfoodpvtltd@gmail.com",
      "akoranicsfoodpvtltd@gmail.com"
    ];
    
    const userEmail = normalizedEmail;
    const isCompanyEmail = companyEmails.includes(userEmail);
    const userRole = isCompanyEmail ? "admin" : "user";

    const token = jwt.sign(
      { 
        id: result.insertId, 
        email: normalizedEmail,
        role: userRole,
        name: `${firstName} ${lastName}`.trim(),
        isCompanyEmail: isCompanyEmail
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "3d" }
    );

    res.cookie("jwt", token, { 
      httpOnly: true, 
      maxAge: 3 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.cookie("user_session", "active", {
      httpOnly: false,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.status(201).json({ 
      success: true,
      message: "Signup successful",
      user: { 
        id: result.insertId, 
        first_name: firstName, 
        last_name: lastName, 
        email: normalizedEmail,
        role: userRole,
        isCompanyEmail: isCompanyEmail
      },
      redirectTo: isCompanyEmail ? "/admin/dashboard" : null
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Signup failed", 
      error: err.message 
    });
  }
};