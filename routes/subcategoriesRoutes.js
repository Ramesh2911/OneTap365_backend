import express from "express";
import {
    createSubcategory,
    getSubcategoriesByCategory,
    updateSubcategory
} from "../controllers/subcategoriesController.js";
import { upload } from "../middleware/upload.js";
import { verifyToken } from "../middleware/auth.js";

const subCategoriesRoutes = express.Router();

subCategoriesRoutes.post("/create-subcategory", verifyToken, upload.single("image"), createSubcategory);
subCategoriesRoutes.get("/category", verifyToken, getSubcategoriesByCategory);
subCategoriesRoutes.put("/:id", verifyToken, upload.single("image"), updateSubcategory);

export default subCategoriesRoutes;
