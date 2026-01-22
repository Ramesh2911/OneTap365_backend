import db from "../db/db.js";

// CREATE CATEGORY
export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        const icon = req.file ? `uploads/${req.file.filename}` : null;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const sql = `
            INSERT INTO categories (name, icon)
            VALUES (?, ?)
        `;

        const [result] = await db.execute(sql, [name, icon]);

        return res.status(200).json({
            success: true,
            message: "Category created successfully",
        });
    } catch (error) {
        console.error("Create Category Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// GET ALL CATEGORIES
export const getAllCategories = async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT id, name, icon, created_at FROM categories ORDER BY id DESC"
        );

        // when no data found
        if (rows.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No categories found",
                data: []
            });
        }

        // when data exists
        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Get Categories Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // new icon (optional)
        const newIcon = req.file ? `uploads/${req.file.filename}` : null;

        // check category exists
        const [existing] = await db.execute(
            "SELECT icon FROM categories WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // keep old icon if new not uploaded
        const iconToSave = newIcon || existing[0].icon;

        const sql = `
            UPDATE categories
            SET name = ?, icon = ?
            WHERE id = ?
        `;

        await db.execute(sql, [name, iconToSave, id]);

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: {
                id,
                name,
                icon: iconToSave
            }
        });
    } catch (error) {
        console.error("Update Category Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
