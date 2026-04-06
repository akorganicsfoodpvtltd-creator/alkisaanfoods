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
import emailRouter from './routes/email.js'; // your file




import "./config/passport.js";

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = ["http://localhost:3000"];

app.use(cors({
  origin: [
    'https://alkissanfoods.com',
    'https://www.alkissanfoods.com',
    'http://localhost:3000'
  ]
  credentials: true, // allow cookies
}));

// SESSION SETUP
app.use(session({
  secret: process.env.JWT_SECRET || "alkissan_secret",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
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

// Database initialization
initDatabase().then(() => {
  console.log("Database initialized");
});


// CATCH-ALL
// Catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});


// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
// ... other imports and setup ...

// Health check endpoint - ADD THIS BEFORE YOUR OTHER ROUTES
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'E-commerce API',
    version: '1.0.0'
  });
});

// ... your other routes ...

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Orders API: http://localhost:${PORT}/api/orders`);
});
