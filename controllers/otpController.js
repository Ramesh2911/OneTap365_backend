import db from "../db/db.js";

const generateOTP = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

//Send OTP
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number required",
      });
    }

    // delete old OTPs
    await db.query(
      "DELETE FROM otp_verifications WHERE phone = ?",
      [phone]
    );

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // save OTP
    await db.query(
      `INSERT INTO otp_verifications (phone, otp, expires_at)
       VALUES (?, ?, ?)`,
      [phone, otp, expiresAt]
    );

    // ✅ RETURN OTP DIRECTLY
    res.json({
      success: true,
      message: "OTP generated successfully",
      otp: otp,
    });

  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({
      success: false,
      message: "OTP send failed",
    });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP required",
      });
    }

    const [rows] = await db.query(
      `SELECT * FROM otp_verifications
       WHERE phone = ?
       AND otp = ?
       AND expires_at >= NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone, otp]
    );

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // delete OTP after use
    await db.query(
      "DELETE FROM otp_verifications WHERE id = ?",
      [rows[0].id]
    );

    res.json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

// Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number required",
      });
    }
   
    const [recent] = await db.query(
      `SELECT created_at FROM otp_verifications
       WHERE phone = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone]
    );

    if (recent.length) {
      const lastSentAt = new Date(recent[0].created_at);
      const diffSeconds = (Date.now() - lastSentAt.getTime()) / 1000;

      if (diffSeconds < 60) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(60 - diffSeconds)} seconds to resend OTP`,
        });
      }
    }
   
    await db.query(
      "DELETE FROM otp_verifications WHERE phone = ?",
      [phone]
    );

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
   
    await db.query(
      `INSERT INTO otp_verifications (phone, otp, expires_at)
       VALUES (?, ?, ?)`,
      [phone, otp, expiresAt]
    );

    res.json({
      success: true,
      message: "OTP resent successfully",
      otp: otp, 
    });

  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(500).json({
      success: false,
      message: "Resend OTP failed",
    });
  }
};