// routes/contact.js — clean version
import express from "express";
import nodemailer from "nodemailer";
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  // ✅ Check env vars first — give a clear error
  if (!process.env.COMPANY_EMAIL || !process.env.COMPANY_EMAIL_PASSWORD) {
    console.error("❌ COMPANY_EMAIL or COMPANY_EMAIL_PASSWORD not set in Railway!");
    return res.status(500).json({ success: false, message: "Email service not configured" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.COMPANY_EMAIL,
        pass: process.env.COMPANY_EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.COMPANY_EMAIL,
      to: process.env.COMPANY_EMAIL,
      replyTo: email,
      subject: `[Contact Form] ${name} - ${subject}`,
      html: `
        <h2 style="color:#2d6a4f;">New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b><br/>${message}</p>
      `,
    });

    console.log("✅ Contact email sent from:", email);
    return res.status(200).json({ success: true, message: "Message sent successfully" });

  } catch (error) {
    console.error("❌ Email error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to send email: " + error.message });
  }
});

export default router;
