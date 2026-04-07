import db from "../config/db.js";
import { v4 as uuidv4 } from 'uuid';

// Find user by Google ID
export async function findByGoogleId(googleId) {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE google_id = ?",
    [googleId]
  );
  return rows[0];
}

// Find user by email
export async function findByEmail(email) {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
}

// Find user by ID
export async function findById(id) {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE user_id = ?",
    [id]
  );
  return rows[0];
}

// Create Google user
export async function createGoogleUser({ firstName, lastName, email, googleId }) {
  const userId = uuidv4();
  await db.query(
    "INSERT INTO users (user_id, first_name, last_name, email, password, google_id, login_method, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [userId, firstName, lastName, email, null, googleId, 'google', 1]
  );
  return {
    id: userId,
    first_name: firstName,
    last_name: lastName,
    email: email,
    google_id: googleId,
    login_method: 'google',
    is_verified: true
  };
}

// Create email user
export async function createEmailUser({ email, name, loginMethod = 'email' }) {
  const nameParts = name ? name.split(' ') : [email.split('@')[0]];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const userId = uuidv4();

  await db.query(
    "INSERT INTO users (user_id, first_name, last_name, email, password, login_method, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [userId, firstName, lastName, email, null, loginMethod, 1]
  );

  return {
    id: userId,
    first_name: firstName,
    last_name: lastName,
    email,
    login_method: loginMethod,
    is_verified: true
  };
}
