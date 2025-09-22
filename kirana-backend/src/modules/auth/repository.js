import { query } from "../../db/connection.js";
import pool from "../../db/connection.js";



export async function findUserById(userId) {
  const rows = await query(
    "SELECT user_id, name, email, phone, role, is_active, password_hash, created_at FROM users WHERE user_id = ? LIMIT 1",
    [userId]
  );
  return rows[0];
}

export async function findUserByEmailOrPhone(identifier) {
  const digits = String(identifier).replace(/\D/g, "");
  const isPhone = /^[6-9]\d{9}$/.test(digits);
  if (isPhone) {
    const rows = await query(
      "SELECT user_id, name, email, phone, role, is_active, password_hash FROM users WHERE phone = ? LIMIT 1",
      [digits]
    );
    return rows[0];
  } else {
    const rows = await query(
      "SELECT user_id, name, email, phone, role, is_active, password_hash FROM users WHERE email = ? LIMIT 1",
      [String(identifier).toLowerCase()]
    );
    return rows[0];
  }
}

// helper to get next USR id
async function nextUserId() {
  // We need the insertId; use pool.execute directly rather than query()
  const [result] = await pool.execute("INSERT INTO user_sequence VALUES (NULL)");
  const insertId = (result && result.insertId) ? result.insertId : null;
  if (!insertId) throw new Error("Could not generate user sequence");
  return `USR${String(insertId).padStart(4, "0")}`;
}


function parseMaybeJson(val) {
  if (val == null) return null;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val; // already an object (mysql2 returns JSON columns as objects on many setups)
}


// ===== Users =====
export async function findUserByPhone(phone) {
  const rows = await query(
    "SELECT user_id, phone FROM users WHERE phone = ? LIMIT 1",
    [phone]
  );
  return rows[0];
}

export async function findUserByEmail(email) {
  if (!email) return undefined;
  const rows = await query(
    "SELECT user_id, email FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0];
}

// export async function insertUserFromPayload(payload) {
//   await query(
//     "INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)",
//     [
//       payload.name,
//       payload.email || null,
//       payload.phone,
//       payload.password_hash,
//       payload.role || "seller",
//     ]
//   );
//   const r = await query(
//     "SELECT user_id FROM users WHERE phone = ? LIMIT 1",
//     [payload.phone]
//   );
//   return r?.[0]?.user_id;
// }

export async function insertUserFromPayload(payload) {
  const user_id = await nextUserId();
  await query(
    "INSERT INTO users (user_id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)",
    [
      user_id,
      payload.name,
      payload.email || null,
      payload.phone,
      payload.password_hash,
      payload.role || "seller",
    ]
  );
  return user_id;
}


// ===== OTPs =====
export async function insertOtpCode({
  phone,
  email,
  code,
  purpose,      // 'signup'
  channel,      // 'sms' | 'email'
  payload_json, // JSON object
  ttlSec,
  maxAttempts,
}) {
  await query(
    `INSERT INTO otp_codes
       (user_id, phone, email, code, purpose, channel, payload_json, attempts, max_attempts, is_used, expires_at, sent_at)
     VALUES
       (NULL, ?, ?, ?, ?, ?, ?, 0, ?, 0, NOW() + INTERVAL ? SECOND, NOW())`,
    [
      phone || null,
      email || null,
      code,
      purpose,
      channel,
      JSON.stringify(payload_json || null),
      maxAttempts,
      ttlSec,
    ]
  );
}

// export async function findActiveOtpForSignup({ email, phone }) {
//   const rows = await query(
//     `SELECT
//         otp_id AS id,
//         code,
//         attempts,
//         max_attempts,
//         expires_at,
//         is_used,
//         JSON_EXTRACT(payload_json, '$') AS payload_json
//      FROM otp_codes
//      WHERE purpose = 'signup'
//        AND is_used = 0
//        AND expires_at >= NOW()
//        AND ( ( ? IS NOT NULL AND email = ? ) OR ( ? IS NOT NULL AND phone = ? ) )
//      ORDER BY otp_id DESC
//      LIMIT 1`,
//     [email || null, email || null, phone || null, phone || null]
//   );

//   const row = rows[0];
//   if (!row) return null;

//   return {
//     ...row,
//     payload_json: row.payload_json ? JSON.parse(row.payload_json) : null,
//   };
// }


export async function findActiveOtpForSignup({ email, phone }) {
  const rows = await query(
    `SELECT
        otp_id AS id,
        code,
        attempts,
        max_attempts,
        expires_at,
        is_used,
        payload_json
     FROM otp_codes
     WHERE purpose = 'signup'
       AND is_used = 0
       AND expires_at >= NOW()
       AND ( ( ? IS NOT NULL AND email = ? ) OR ( ? IS NOT NULL AND phone = ? ) )
     ORDER BY otp_id DESC
     LIMIT 1`,
    [email || null, email || null, phone || null, phone || null]
  );

  const row = rows[0];
  if (!row) return null;

  return {
    ...row,
    payload_json: parseMaybeJson(row.payload_json),
  };
}

export async function incrementOtpAttempts(id) {
  await query(
    "UPDATE otp_codes SET attempts = attempts + 1 WHERE otp_id = ?",
    [id]
  );
}

export async function markOtpUsed(id) {
  await query(
    "UPDATE otp_codes SET is_used = 1 WHERE otp_id = ?",
    [id]
  );
}

// export async function resendableOtpForSignup({ email, phone }) {
//   const rows = await query(
//     `SELECT
//         otp_id AS id,
//         email,
//         phone,
//         JSON_EXTRACT(payload_json, '$') AS payload_json
//      FROM otp_codes
//      WHERE purpose = 'signup'
//        AND ( ( ? IS NOT NULL AND email = ? ) OR ( ? IS NOT NULL AND phone = ? ) )
//      ORDER BY otp_id DESC
//      LIMIT 1`,
//     [email || null, email || null, phone || null, phone || null]
//   );

//   const row = rows[0];
//   if (!row) return null;

//   return {
//     ...row,
//     payload_json: row.payload_json ? JSON.parse(row.payload_json) : null,
//   };
// }



export async function resendableOtpForSignup({ email, phone }) {
  const rows = await query(
    `SELECT
        otp_id AS id,
        email,
        phone,
        payload_json
     FROM otp_codes
     WHERE purpose = 'signup'
       AND ( ( ? IS NOT NULL AND email = ? ) OR ( ? IS NOT NULL AND phone = ? ) )
     ORDER BY otp_id DESC
     LIMIT 1`,
    [email || null, email || null, phone || null, phone || null]
  );

  const row = rows[0];
  if (!row) return null;

  return {
    ...row,
    payload_json: parseMaybeJson(row.payload_json),
  };
}
