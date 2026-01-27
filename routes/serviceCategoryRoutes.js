import express from "express";
import {
    createServiceCategory,
    listServiceCategories,
    updateServiceCategory
} from "../controllers/serviceCategoryController.js";
import { upload } from "../middleware/upload.js";
import { verifyToken } from "../middleware/auth.js";

const serviceCategoriesRoutes = express.Router();

serviceCategoriesRoutes.post("/create-serviceCategory", verifyToken,upload.single("icon"), createServiceCategory);
serviceCategoriesRoutes.get("/all-serviceCategory", verifyToken, listServiceCategories);
serviceCategoriesRoutes.put("/:id", verifyToken, updateServiceCategory);

export default serviceCategoriesRoutes;
