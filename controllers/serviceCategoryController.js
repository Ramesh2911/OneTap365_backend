import db from "../db/db.js";

// Create a new service category
export const createServiceCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const icon = req.file ? req.file.filename : null;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        await db.execute(
            "INSERT INTO service_categories (name, icon) VALUES (?, ?)",
            [name.trim(), icon]
        );

        res.status(200).json({
            success: true,
            message: "Service category created successfully"
        });
    } catch (error) {
        console.error("Create Service Category Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Get all service categories
export const listServiceCategories = async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT id, name, icon FROM service_categories WHERE is_active = 1 ORDER BY name"
        );

        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("List Service Categories Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Update a service category
export const updateServiceCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon } = req.body;

        await db.execute(
            "UPDATE service_categories SET name=?, icon=? WHERE id=?",
            [name, icon || null, id]
        );

        res.status(200).json({
            success: true,
            message: "Service category updated successfully"
        });
    } catch (error) {
        console.error("Update Service Category Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
