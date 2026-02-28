import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";

import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cart.js";
import authRoutes from "./routes/authRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import storesRoutes from "./routes/stores.js";
import initDatabase from "./initDB.js";
import contactRoutes from "./routes/contactRoutes.js";
import ordersRoutes from "./routes/orders.js";
import emailRouter from "./routes/email.js";

import "./config/passport.js";

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(cookieParser());

// ✅ Allow Railway + localhost
const allowedOrigins = [
  "http://localhost:3000",
  "https://your-frontend-domain.com", // put your real frontend here
];

app.use(cors({
  origin: true, // allow all origins for now (simpler for testing)
  credentials: true,
}));

// SESSION
app.use(session({
  secret: process.env.JWT_SECRET || "alkissan_secret",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// ✅ HEALTH ROUTE (must be BEFORE listen)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ROUTES
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", chatbotRoutes);
app.use("/api/stores", storesRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/email", emailRouter);
app.use("/api/orders", ordersRoutes);

// CATCH-ALL
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// DB (don’t block server start)
initDatabase().catch(err => {
  console.error("❌ Database init failed:", err.message);
});

// ✅ START SERVER ON RAILWAY PORT + HOST
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server live on port ${PORT}`);
});
