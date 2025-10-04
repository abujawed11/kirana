// src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { signToken } from "../utils/jwt.js";

export async function signupSeller(req, res) {
  try {
    const { name, email, phone, password } = req.body || {};

    // ✅ New validation: email OR phone, not necessarily both
    const hasEmail = !!(email && String(email).trim());
    const cleanPhone = phone ? String(phone).replace(/\D/g, "") : "";
    const hasPhone = !!cleanPhone;

    if (!name || !password || (!hasEmail && !hasPhone)) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // Optional: normalize empty values to null for SQL
    const normEmail = hasEmail ? String(email).trim() : null;
    const normPhone = hasPhone ? cleanPhone : null;

    // Uniqueness check within SELLER role (composite uniqueness by role)
    const [exists] = await pool.query(
      "SELECT id FROM users WHERE (email = ? AND role='SELLER') OR (phone = ? AND role='SELLER') LIMIT 1",
      [normEmail, normPhone]
    );
    if (exists.length) {
      return res.status(409).json({ success: false, message: "Seller with same email/phone exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'SELLER')",
      [name.trim(), normEmail, normPhone, hash]
    );
    const userId = result.insertId;

    // Optional: generate display code like USR0001
    const userCode = `USR${String(userId).padStart(4, "0")}`;
    await pool.query("UPDATE users SET user_code=? WHERE id=?", [userCode, userId]);

    // ❌ No store_name here — collect later during KYC
    // If you still want a placeholder seller_profile row:
    // await pool.query("INSERT INTO seller_profiles (user_id, store_name) VALUES (?, ?)", [userId, '']);

    return res.json({ success: true, message: "Seller created. Please log in." });
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