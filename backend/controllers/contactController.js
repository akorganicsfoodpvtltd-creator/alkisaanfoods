import transporter from "../config/mailer.js";

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Here you would integrate with email service like Nodemailer
    console.log("Contact message received:", req.body);

    return res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
