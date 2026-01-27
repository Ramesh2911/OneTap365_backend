import express from "express";
import {
    createCategory,
    getAllCategories,
    updateCategory
} from "../controllers/categoriesController.js";
import { upload } from "../middleware/upload.js";
import { verifyToken } from "../middleware/auth.js";

const categoriesRoutes = express.Router();

categoriesRoutes.post(
    "/create-category",
    verifyToken,
    upload.single("icon"),
    createCategory
);

categoriesRoutes.get(
    "/all-categories",
    getAllCategories
);

categoriesRoutes.put(
    "/:id",
    verifyToken,
    upload.single("icon"),
    updateCategory
);

export default categoriesRoutes;
