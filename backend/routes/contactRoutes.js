import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    // Nodemailer transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.COMPANY_EMAIL,
        pass: process.env.COMPANY_EMAIL_PASSWORD, // Use Gmail App Password
      },
    });

    // Professional email content
    const mailOptions = {
      from: process.env.COMPANY_EMAIL,  // Must be your Gmail
      to: process.env.COMPANY_EMAIL,    // Company receives email
      replyTo: email,                   // Replies go to user email
      subject: `[${name}] ${subject}`,  // User name in subject
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p style="white-space: pre-line;">${message}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">
            This message was sent via the Al Kissan Foods website contact form.
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log("Contact message sent:", { name, email, subject, message });

    return res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Email sending error:", error);
    return res.status(500).json({ success: false, message: "Email service not configured" });
  }
});

export default router;
