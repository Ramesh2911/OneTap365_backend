import jwt from "jsonwebtoken";
import db from "../db/db.js";

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];

        if (!authHeader) {
            return res.status(403).json({
                success: false,
                message: "No token provided"
            });
        }

        // Expect: Bearer TOKEN
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }

        const token = parts[1];

        // 1️⃣ Verify JWT signature
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 2️⃣ Check token in DB
        const [rows] = await db.execute(
            `
            SELECT id, user_id, is_revoked, expires_at
            FROM user_tokens
            WHERE access_token = ?
            LIMIT 1
            `,
            [token]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Token not found"
            });
        }

        const tokenRow = rows[0];

        // 3️⃣ Check revoked
        if (tokenRow.is_revoked === 1) {
            return res.status(401).json({
                success: false,
                message: "Token revoked. Please login again"
            });
        }

        // 4️⃣ Check expiry
        if (new Date(tokenRow.expires_at) < new Date()) {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please login again"
            });
        }

        // ✅ Attach user info
        req.user = {
            id: tokenRow.user_id,
            ...decoded
        };

        next();
    } catch (error) {
        console.error("Auth Error:", error);

        return res.status(401).json({
            success: false,
            message: "Unauthorized or invalid token"
        });
    }
};
