import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

// Store verification codes
const verificationCodes = new Map();

// Generate code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Export 1: sendVerificationCode
export const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    const code = generateCode();
    verificationCodes.set(email, { 
      code, 
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    console.log(`Code for ${email}: ${code}`);

    // Try to send email if credentials exist
    if (process.env.COMPANY_EMAIL && process.env.COMPANY_EMAIL_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.COMPANY_EMAIL,
            pass: process.env.COMPANY_EMAIL_PASSWORD,
          }
        });

        await transporter.sendMail({
          from: `"Al Kissan Foods" <${process.env.COMPANY_EMAIL}>`,
          to: email,
          subject: 'Your Verification Code',
          text: `Your verification code is: ${code}`,
          html: `<p>Your verification code is: <strong>${code}</strong></p>`
        });
        
        return res.json({ 
          success: true, 
          message: 'Verification code sent to email' 
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError.message);
        // Continue to return code in response
      }
    }

    // Return code in response (for development or if email fails)
    res.json({ 
      success: true, 
      message: 'Verification code generated',
      code: code,
      testMode: true 
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send verification code',
      error: error.message 
    });
  }
};

// Export 2: verifyCode
export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required"
      });
    }

    const stored = verificationCodes.get(email);
    
    if (!stored) {
      return res.status(400).json({
        success: false,
        message: "No verification code found"
      });
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: "Verification code has expired"
      });
    }

    if (stored.code !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code"
      });
    }

    // Code valid - remove it
    verificationCodes.delete(email);
    
    // Check/create user in database
    const [users] = await pool.query(
      "SELECT id, email, name, role FROM users WHERE email = ?",
      [email]
    );

    let user;
    
    if (users.length > 0) {
      user = users[0];
    } else {
      const name = email.split('@')[0];
      const [result] = await pool.query(
        "INSERT INTO users (email, name, role) VALUES (?, ?, ?)",
        [email, name, 'user']
      );
      
      user = {
        id: result.insertId,
        email: email,
        name: name,
        role: 'user'
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        loginMethod: 'email_otp'
      },
      process.env.JWT_SECRET || 'alkissan_secret',
      { expiresIn: "3d" }
    );

    res.json({
      success: true,
      message: "Verification successful",
      token: token,
      user: user
    });

  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify code',
      error: error.message
    });
  }
};

// Export 3: resendCode
export const resendCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Remove old code
    verificationCodes.delete(email);
    
    // Call sendVerificationCode internally
    const code = generateCode();
    verificationCodes.set(email, { 
      code, 
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    console.log(`Resent code for ${email}: ${code}`);

    if (process.env.COMPANY_EMAIL && process.env.COMPANY_EMAIL_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.COMPANY_EMAIL,
            pass: process.env.COMPANY_EMAIL_PASSWORD,
          }
        });

        await transporter.sendMail({
          from: `"Al Kissan Foods" <${process.env.COMPANY_EMAIL}>`,
          to: email,
          subject: 'Your New Verification Code',
          text: `Your new verification code is: ${code}`,
          html: `<p>Your new verification code is: <strong>${code}</strong></p>`
        });
        
        return res.json({ 
          success: true, 
          message: 'New verification code sent' 
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError.message);
      }
    }

    res.json({ 
      success: true, 
      message: 'New verification code generated',
      code: code,
      testMode: true 
    });

  } catch (error) {
    console.error('Error resending code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend code',
      error: error.message
    });
  }
};

// Debug: Show exports
console.log('✅ emailAuthController.js loaded with exports: sendVerificationCode, verifyCode, resendCode');