import db from "../db/db.js";

// CREATE SUBCATEGORY
export const createSubcategory = async (req, res) => {
    try {
        const { cat_id, name } = req.body;
        const image = req.file ? `uploads/${req.file.filename}` : null;

        if (!cat_id || !name) {
            return res.status(400).json({
                success: false,
                message: "category and name are required"
            });
        }
       
        const [category] = await db.execute(
            "SELECT id FROM categories WHERE id = ?",
            [cat_id]
        );

        if (category.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        
        const [existing] = await db.execute(
            "SELECT id FROM subcategories WHERE cat_id = ? AND name = ?",
            [cat_id, name]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Subcategory name already exists in this category"
            });
        }

        const sql = `
            INSERT INTO subcategories (cat_id, name, image)
            VALUES (?, ?, ?)
        `;

        await db.execute(sql, [cat_id, name, image]);

        return res.status(201).json({
            success: true,
            message: "Subcategory created successfully"
        });
    } catch (error) {
        console.error("Create Subcategory Error:", error);
       
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Subcategory already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// GET SUBCATEGORIES BY CATEGORY
export const getSubcategoriesByCategory = async (req, res) => {
    try {
        const { cat_id } = req.query;

        if (!cat_id) {
            return res.status(400).json({
                success: false,
                message: "cat_id is required"
            });
        }

        const [rows] = await db.execute(
            "SELECT id, name, image FROM subcategories WHERE cat_id = ?",
            [cat_id]
        );

        if (rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No subcategories found",
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Get Subcategories Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// UPDATE SUBCATEGORY
export const updateSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const newImage = req.file ? `uploads/${req.file.filename}` : null;

        const [existing] = await db.execute(
            "SELECT image FROM subcategories WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Subcategory not found"
            });
        }

        const imageToSave = newImage || existing[0].image;

        await db.execute(
            "UPDATE subcategories SET name = ?, image = ? WHERE id = ?",
            [name, imageToSave, id]
        );

        return res.status(200).json({
            success: true,
            message: "Subcategory updated successfully"
        });
    } catch (error) {
        console.error("Update Subcategory Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

