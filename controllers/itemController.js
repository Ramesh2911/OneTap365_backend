import db from "../db/db.js";

//CREATE ITEM 
export const createItem = async (req, res) => {
    try {
        const userId = req.user.id;

        const [[user]] = await db.execute(
            "SELECT role_id FROM users WHERE id = ?",
            [userId]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const roleId = user.role_id;

        const {
            item_type,
            cat_id,
            subcat_id,
            name,
            description,
            mrp,
            selling_price,
            discount,
            city,
            state,
            pincode
        } = req.body;

        if (roleId === 2) {
            const [[count]] = await db.execute(
                "SELECT COUNT(*) AS total FROM items WHERE user_id = ?",
                [userId]
            );

            if (count.total >= 1) {
                const [sub] = await db.execute(
                    "SELECT id FROM user_subscriptions WHERE user_id = ? AND is_active = 1",
                    [userId]
                );

                if (sub.length === 0) {
                    return res.status(403).json({
                        success: false,
                        message: "Please purchase a subscription plan to create more items"
                    });
                }
            }
        }

        const [result] = await db.execute(
            `
            INSERT INTO items
            (user_id, item_type, cat_id, subcat_id,
             name, description, mrp, selling_price, discount,
             city, state, pincode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                userId,
                item_type,
                cat_id,
                subcat_id,
                name,
                description || null,
                mrp || null,
                selling_price,
                discount || 0,
                city || null,
                state || null,
                pincode || null
            ]
        );

        const itemId = result.insertId;

        if (req.files?.length) {
            for (const file of req.files) {
                await db.execute(
                    "INSERT INTO item_photos (item_id, photo) VALUES (?, ?)",
                    [itemId, `uploads/${file.filename}`]
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "Item created successfully"
        });

    } catch (error) {
        console.error("Create Item Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

//ITEM LIST
export const getItems = async (req, res) => {
    try {
        const { cat_id, subcat_id, city, item_type } = req.query;

        let conditions = [];
        let params = [];

        if (cat_id) {
            conditions.push("i.cat_id = ?");
            params.push(cat_id);
        }

        if (subcat_id) {
            conditions.push("i.subcat_id = ?");
            params.push(subcat_id);
        }

        if (city) {
            conditions.push("i.city = ?");
            params.push(city);
        }

        if (item_type) {
            conditions.push("i.item_type = ?");
            params.push(item_type);
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const [rows] = await db.execute(
            `
            SELECT 
                i.id,
                i.name,
                i.item_type,
                i.selling_price,
                i.discount,
                i.city,
                i.state,
                i.pincode,
                i.created_at,

                c.name AS category_name,
                s.name AS subcategory_name,

                u.name AS user_name,
                u.role_id,

                GROUP_CONCAT(p.photo) AS photos
            FROM items i
            JOIN categories c ON c.id = i.cat_id
            JOIN subcategories s ON s.id = i.subcat_id
            JOIN users u ON u.id = i.user_id
            LEFT JOIN item_photos p ON p.item_id = i.id

            ${whereClause}

            GROUP BY i.id
            ORDER BY i.id DESC
            `,
            params
        );

        // 🔹 NO DATA FOUND
        if (rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No items found",
                data: []
            });
        }

        const data = rows.map(item => ({
            ...item,
            photos: item.photos ? item.photos.split(",") : []
        }));

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error("Item List Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};