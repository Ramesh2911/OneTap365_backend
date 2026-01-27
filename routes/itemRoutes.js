import express from "express";
import 
{ 
    createItem,
    getItems
 } from "../controllers/itemController.js";
import { verifyToken } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const itemRoutes = express.Router();

itemRoutes.post(
    "/create-item",
    verifyToken,
    upload.array("photos", 5),
    createItem
);
itemRoutes.get(
    "/all-items",
    verifyToken,
    getItems
);

export default itemRoutes;
