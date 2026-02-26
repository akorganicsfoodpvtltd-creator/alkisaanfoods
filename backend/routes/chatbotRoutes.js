import express from "express";
import { chatbotReply } from "../controllers/chatbotController.js";

const router = express.Router();

/**
 * @route   POST /api/chatbot/chat
 * @desc    Chat with AI assistant
 * @access  Public
 */
router.post("/chat", chatbotReply);

/**
 * @route   GET /api/chatbot/health
 * @desc    Check chatbot health
 * @access  Public
 */
router.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Chatbot is running",
    timestamp: new Date()
  });
});

export default router;