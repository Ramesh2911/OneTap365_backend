import db from "../db/db.js";

// CREATE SUBSCRIPTION PLAN
export const createSubscription = async (req, res) => {
    try {
        const {
            plan_name,
            bg_color,
            text_color,
            badge_color,
            price,
            duration,
            active_listings,
            featured_listings,
            priority_search,
            whatsapp_leads,
            support_type
        } = req.body;

        if (!plan_name || !bg_color || !text_color || !badge_color || !duration) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing"
            });
        }

        await db.execute(
            `
            INSERT INTO subscriptions
            (plan_name, bg_color, text_color, badge_color, price, duration,
             active_listings, featured_listings, priority_search, whatsapp_leads, support_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                plan_name,
                bg_color,
                text_color,
                badge_color,
                price || 0,
                duration,
                active_listings || 0,
                featured_listings || 0,
                priority_search || 0,
                whatsapp_leads || 0,
                support_type || 'Standard'
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Subscription plan created successfully"
        });
    } catch (error) {
        console.error("Create Subscription Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// GET ALL ACTIVE SUBSCRIPTIONS
export const getAllSubscriptions = async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT * FROM subscriptions WHERE is_active = 1 ORDER BY price ASC"
        );

        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Get Subscriptions Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// UPDATE SUBSCRIPTION
export const updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.execute(
            "SELECT id FROM subscriptions WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found"
            });
        }

        await db.execute(
            `
            UPDATE subscriptions
            SET plan_name=?, bg_color=?, text_color=?, badge_color=?, price=?, duration=?,
                active_listings=?, featured_listings=?, priority_search=?, whatsapp_leads=?, support_type=?
            WHERE id=?
            `,
            [
                req.body.plan_name,
                req.body.bg_color,
                req.body.text_color,
                req.body.badge_color,
                req.body.price,
                req.body.duration,
                req.body.active_listings,
                req.body.featured_listings,
                req.body.priority_search,
                req.body.whatsapp_leads,
                req.body.support_type,
                id
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Subscription updated successfully"
        });
    } catch (error) {
        console.error("Update Subscription Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// SOFT DELETE SUBSCRIPTION
export const deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        await db.execute(
            "UPDATE subscriptions SET is_active = 0 WHERE id = ?",
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Subscription removed successfully"
        });
    } catch (error) {
        console.error("Delete Subscription Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
