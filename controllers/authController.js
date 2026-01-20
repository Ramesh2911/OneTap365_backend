import db from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { isValidPhone, isValidEmail } from "../utils/validation.js";

// Customer Registration
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      addar_no,
    } = req.body;

    // 🔴 Required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required",
      });
    }

    // 📱 Phone validation
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // 📧 Email validation
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // 🔍 Check duplicate phone or email
    const [existing] = await db.query(
      "SELECT id FROM users WHERE phone = ? OR email = ?",
      [phone, email]
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "Phone number or email already registered",
      });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📂 Files
    const profileImage = req.files?.profile_image?.[0]?.filename || null;
    const addarFront = req.files?.addar_front?.[0]?.filename || null;
    const addarBack = req.files?.addar_back?.[0]?.filename || null;

    // 📝 Insert user
    await db.query(
      `INSERT INTO users
      (role_id, name, email, phone, password, profile_image, addar_no, addar_front, addar_back)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        2,
        name,
        email,
        phone,
        hashedPassword,
        profileImage,
        addar_no || null,
        addarFront,
        addarBack,
      ]
    );

    res.status(200).json({
      success: true,
      message: "Customer registered successfully",
    });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// Customer Login
export const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone and password are required",
      });
    }
   
    const [users] = await db.query(
      `SELECT * FROM users
       WHERE email = ? OR phone = ?
       LIMIT 1`,
      [login, login]
    );

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = users[0];
   
    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }
   
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
   
    const accessToken = jwt.sign(
      { user_id: user.id, role_id: user.role_id },
      "ACCESS_SECRET_KEY",
      { expiresIn: "15m" }
    );

    const refreshToken = uuidv4();
   
    await db.query(
      `UPDATE user_tokens
       SET is_revoked = 1
       WHERE user_id = ?`,
      [user.id]
    );
    
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
   
    await db.query(
      `INSERT INTO user_tokens
      (user_id, access_token, refresh_token, is_revoked, expires_at)
      VALUES (?, ?, ?, ?, ?)`,
      [
        user.id,
        accessToken,
        refreshToken,
        0,
        expiresAt,
      ]
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user_id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// Customer Logout