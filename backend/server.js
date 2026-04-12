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
import contactRoutes from './routes/contactRoutes.js';
import ordersRoutes from './routes/orders.js';
import emailRouter from './routes/email.js';
import "./config/passport.js";

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: [
    'https://alkissanfoods.com',
    'https://www.alkissanfoods.com',
    'https://alkisaanfoods-gtsr.vercel.app',
    'https://www.alkisaanfoods-gtsr.vercel.app',
    'https://alkisaanfoods-production-34db.up.railway.app', // ✅ Railway URL added
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// ✅ SESSION — sirf ek baar (duplicate hata diya)
app.use(session({
  secret: process.env.JWT_SECRET || "alkissan_secret",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: true,      // ✅ HTTPS ke liye
    sameSite: 'none',  // ✅ cross-domain ke liye
    httpOnly: true
  }
}));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// ROUTES
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", chatbotRoutes);
app.use("/api/stores", storesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/email', emailRouter);
app.use('/api/orders', ordersRoutes);

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'E-commerce API',
    version: '1.0.0'
  });
});

// CATCH-ALL
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Database initialization
initDatabase().then(() => {
  console.log("Database initialized");
});

// START SERVER
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Orders API: http://localhost:${PORT}/api/orders`);
});
