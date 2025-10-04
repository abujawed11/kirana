// src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { signToken } from "../utils/jwt.js";


export async function signupSeller(req, res) {
  try {
    const { name, email, phone, password } = req.body || {};

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const normEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).replace(/\D/g, "");

    if (!/^\S+@\S+\.\S+$/.test(normEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    // Uniqueness check
    const [exists] = await pool.query(
      "SELECT id FROM users WHERE (email = ? AND role='SELLER') OR (phone = ? AND role='SELLER') LIMIT 1",
      [normEmail, cleanPhone]
    );
    if (exists.length) {
      return res.status(409).json({ success: false, message: "Seller already exists with same email or phone" });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'SELLER')",
      [name.trim(), normEmail, cleanPhone, hash]
    );

    const userId = result.insertId;
    const userCode = `USR${String(userId).padStart(4, "0")}`;
    await pool.query("UPDATE users SET user_code=? WHERE id=?", [userCode, userId]);

    return res.json({ success: true, message: "Seller account created. Please log in." });
  } catch (e) {
    console.error("signupSeller error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
}



export async function login(req, res) {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // Seller-only login (prevents customer accounts from logging into seller app)
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, password_hash, role FROM users WHERE (email = ? OR phone = ?) AND role='SELLER' LIMIT 1",
      [emailOrPhone, emailOrPhone]
    );
    if (!rows.length) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = signToken({ uid: user.id, role: user.role }); // role embedded
    return res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
}