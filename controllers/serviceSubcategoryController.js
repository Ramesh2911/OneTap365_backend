import db from "../db/db.js";

// Create a new service subcategory
export const createServiceSubcategory = async (req, res) => {
    try {
        const { category_id, name } = req.body;

        if (!category_id || !name) {
            return res.status(400).json({
                success: false,
                message: "category and name are required"
            });
        }

        await db.execute(
            "INSERT INTO service_subcategories (category_id, name) VALUES (?, ?)",
            [category_id, name]
        );

        res.status(200).json({
            success: true,
            message: "Service subcategory created successfully"
        });
    } catch (error) {
        console.error("Create Service Subcategory Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Get all service subcategories by category
export const listSubcategoriesByCategory = async (req, res) => {
    try {
        const { category_id } = req.query;

        if (!category_id) {
            return res.status(400).json({
                success: false,
                message: "category_id is required"
            });
        }

        const [rows] = await db.execute(
            "SELECT id, name FROM service_subcategories WHERE category_id = ? AND is_active = 1",
            [category_id]
        );

        // If no data found
        if (rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No service subcategory found",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Service subcategories retrieved successfully",
            data: rows
        });

    } catch (error) {
        console.error("List Subcategories Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Update a service subcategory
export const updateServiceSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        await db.execute(
            "UPDATE service_subcategories SET name=? WHERE id=?",
            [name, id]
        );

        res.status(200).json({
            success: true,
            message: "Service subcategory updated successfully"
        });
    } catch (error) {
        console.error("Update Service Subcategory Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


