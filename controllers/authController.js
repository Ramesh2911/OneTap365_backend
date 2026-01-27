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

// Service Provider Registration
export const serviceProviderRegister = async (req, res) => {
  try {
    const {
      service_cat_id,
      service_subcat_id,
      name,
      email,
      phone,
      password,
      addar_no,
      pan_no,
    } = req.body;
    
    if (
      !service_cat_id ||
      !service_subcat_id ||
      !name ||
      !email ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Service category, sub category, name, email, phone and password are required",
      });
    }
   
    if (!req.files?.resume_doc) {
      return res.status(400).json({
        success: false,
        message: "Resume document is required",
      });
    }
   
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
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const profileImage = req.files?.profile_image?.[0]?.filename || null;
    const addarFront = req.files?.addar_front?.[0]?.filename || null;
    const addarBack = req.files?.addar_back?.[0]?.filename || null;
    const panImg = req.files?.pan_img?.[0]?.filename || null;
    const resumeDoc = req.files?.resume_doc?.[0]?.filename; 
  
    await db.query(
      `INSERT INTO users
      (
        role_id,
        service_cat_id,
        service_subcat_id,
        name,
        email,
        phone,
        password,
        profile_image,
        addar_no,
        pan_no,
        pan_img,
        resume_doc,
        addar_front,
        addar_back,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        3,
        service_cat_id,
        service_subcat_id,
        name,
        email,
        phone,
        hashedPassword,
        profileImage,
        addar_no || null,
        pan_no || null,
        panImg,
        resumeDoc,
        addarFront,
        addarBack,
        "PENDING",
      ]
    );

    res.status(200).json({
      success: true,
      message: "Service provider registered successfully",
    });
  } catch (err) {
    console.error("Service Provider Register Error:", err);
    res.status(500).json({
      success: false,
      message: "Service provider registration failed",
    });
  }
};

//Login
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
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
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
        role_id: user.role_id,
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

//Logout
export const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(400).json({
                success: false,
                message: "Authorization token missing"
            });
        }

        const token = authHeader.split(" ")[1];

        // revoke token
        const [result] = await db.execute(
            `
            UPDATE user_tokens
            SET is_revoked = 1
            WHERE access_token = ?
            `,
            [token]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: "Token already invalid or not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Update Service Provider Status
export const updateProviderStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "User ID and status are required",
      });
    }
  
    const allowedStatus = ["ACTIVE", "INACTIVE"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }
   
    const [result] = await db.query(
      "UPDATE users SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
    });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};
