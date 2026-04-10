import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  login,
  logout,
  getMe,
  signup
} from "../controllers/authController.js";
import {
  sendVerificationCode,
  verifyCode,
  resendCode
} from "../controllers/emailAuthController.js";

const router = express.Router();

// Email/Password Login
router.post("/login", login);

// Email OTP Login Routes
router.post("/send-code", sendVerificationCode);
router.post("/verify-code", verifyCode);
router.post("/resend-code", resendCode);

// Signup
router.post("/signup", signup);

// Get current user
router.get("/me", getMe);

// Logout
router.post("/logout", logout);

// Google OAuth login route
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/?error=login_failed`
  }),
  (req, res) => {
    try {
      const userEmail = req.user.email || req.user.Email;
      if (!userEmail) {
        return res.redirect(`${process.env.FRONTEND_URL}/?error=email_not_found`);
      }

      const normalizedEmail = userEmail.trim().toLowerCase();

      // ✅ FIXED: Both admin emails included (matching authController.js)
      const companyEmails = [
        "akorganicsfoodpvtltd@gmail.com",
        "akoranicsfoodpvtltd@gmail.com"
      ];
      const isAdmin = companyEmails.includes(normalizedEmail);
      const role = isAdmin ? "admin" : "user";

      const token = jwt.sign(
        {
          id: req.user.id || Date.now(),
          email: normalizedEmail,
          role: role,
          name: req.user.displayName || normalizedEmail.split("@")[0],
          loginMethod: "google"
        },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
      );

      // Cookie for same-domain requests
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });

      res.cookie("user_session", "active", {
        httpOnly: false,
        secure: true,
        sameSite: "none",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });

      // ✅ FIXED: Admin goes directly to dashboard with token
      // Dashboard page reads token from URL itself
      if (isAdmin) {
        return res.redirect(`${process.env.FRONTEND_URL}/admin/dashboard?token=${token}`);
      } else {
        return res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
      }

    } catch (err) {
      console.error("Google callback error:", err);
      return res.redirect(`${process.env.FRONTEND_URL}/?error=login_failed`);
    }
  }
);

// TEST endpoint
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth API is working",
    endpoints: {
      "POST /api/auth/send-code": "Send verification code",
      "POST /api/auth/verify-code": "Verify code and login",
      "POST /api/auth/resend-code": "Resend code",
      "POST /api/auth/login": "Email/password login",
      "GET /api/auth/google": "Google OAuth",
      "GET /api/auth/me": "Get current user",
      "POST /api/auth/logout": "Logout"
    }
  });
});

export default router;
