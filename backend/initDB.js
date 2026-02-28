
import db from "./config/db.js";
import { createEmailVerificationTable } from "./models/EmailVerification.js";

// Add these columns to users table if they don't exist
const initDatabase = async () => {
  try {
    // Check if login_method column exists in users table
    const [columns] = await db.query(`
      SHOW COLUMNS FROM users LIKE 'login_method'
    `);
    
    if (columns.length === 0) {
      console.log("Adding login_method column to users table...");
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN login_method VARCHAR(50) DEFAULT 'password',
        ADD COLUMN is_verified BOOLEAN DEFAULT FALSE
      `);
      console.log("Columns added successfully");
    }

    // Create email verifications table
    await createEmailVerificationTable();
    
    console.log("Database initialization completed");
  } catch (error) {
    console.error("Database initialization error:", error);
  }
};

export default initDatabase;
