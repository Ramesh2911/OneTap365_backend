import express from "express";
import {
    createServiceSubcategory,
    listSubcategoriesByCategory,
    updateServiceSubcategory
} from "../controllers/serviceSubcategoryController.js";
import { verifyToken } from "../middleware/auth.js";

const serviceSubCategoriesRoutes = express.Router();

serviceSubCategoriesRoutes.post("/create-serviceSubcategory",verifyToken, createServiceSubcategory);
serviceSubCategoriesRoutes.get("/serviceCategory",verifyToken, listSubcategoriesByCategory);
serviceSubCategoriesRoutes.put("/:id",verifyToken, updateServiceSubcategory);

export default serviceSubCategoriesRoutes;
