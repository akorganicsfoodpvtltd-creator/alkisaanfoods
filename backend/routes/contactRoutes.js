import express from "express";
import { Resend } from "resend";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY not set!");
    return res.status(500).json({ success: false, message: "Email service not configured" });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Al Kissan Foods <onboarding@resend.dev>", // Resend ka default sender
      to: "akorganicsfoodpvtltd@gmail.com",
      replyTo: email,
      subject: `[Contact Form] ${name} - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color:#2d6a4f; border-bottom: 2px solid #2d6a4f; padding-bottom: 10px;">
            New Contact Form Message
          </h2>
          <table style="width:100%; margin-bottom:20px;">
            <tr>
              <td style="font-weight:bold; padding:6px 0; width:80px;">Name:</td>
              <td>${name}</td>
            </tr>
            <tr>
              <td style="font-weight:bold; padding:6px 0;">Email:</td>
              <td><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="font-weight:bold; padding:6px 0;">Subject:</td>
              <td>${subject}</td>
            </tr>
          </table>
          <div style="background:#f9f9f9; padding:16px; border-left:4px solid #2d6a4f; border-radius:4px;">
            <p style="margin:0; white-space:pre-line;">${message}</p>
          </div>
          <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
          <p style="font-size:12px; color:#999;">Sent via Al Kissan Foods contact form.</p>
        </div>
      `,
    });

    console.log("✅ Contact email sent from:", email);
    return res.status(200).json({ success: true, message: "Message sent successfully" });

  } catch (error) {
    console.error("❌ Resend error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send email: " + error.message,
    });
  }
});

export default router;
