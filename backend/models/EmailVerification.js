import db from "../config/db.js";

export const createEmailVerificationTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_code (code),
        INDEX idx_expires_at (expires_at)
      )
    `);
    console.log("Email verifications table created/verified");
  } catch (error) {
    console.error("Error creating email verifications table:", error);
  }
};

export const findByEmailAndCode = async (email, code) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM email_verifications WHERE email = ? AND code = ? AND expires_at > NOW()",
      [email, code]
    );
    return rows[0];
  } catch (error) {
    console.error("Error finding email verification:", error);
    throw error;
  }
};

export const deleteByEmail = async (email) => {
  try {
    await db.query(
      "DELETE FROM email_verifications WHERE email = ?",
      [email]
    );
  } catch (error) {
    console.error("Error deleting email verification:", error);
    throw error;
  }
};

export const deleteById = async (id) => {
  try {
    await db.query(
      "DELETE FROM email_verifications WHERE id = ?",
      [id]
    );
  } catch (error) {
    console.error("Error deleting email verification by id:", error);
    throw error;
  }
};

export const createEmailVerification = async (email, code) => {
  try {
    // First delete any existing verifications for this email
    await deleteByEmail(email);
    
    // Create new verification (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    const [result] = await db.query(
      "INSERT INTO email_verifications (email, code, expires_at) VALUES (?, ?, ?)",
      [email, code, expiresAt]
    );
    
    return {
      id: result.insertId,
      email,
      code,
      expiresAt
    };
  } catch (error) {
    console.error("Error creating email verification:", error);
    throw error;
  }
};

export const cleanExpiredVerifications = async () => {
  try {
    await db.query(
      "DELETE FROM email_verifications WHERE expires_at <= NOW()"
    );
  } catch (error) {
    console.error("Error cleaning expired verifications:", error);
  }
};