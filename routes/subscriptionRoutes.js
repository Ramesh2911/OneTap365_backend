import express from "express";
import {
    createSubscription,
    getAllSubscriptions,
    updateSubscription,
    deleteSubscription
} from "../controllers/subscriptionController.js";
import { verifyToken } from "../middleware/auth.js";

const subscriptionRoutes = express.Router();

subscriptionRoutes.post("/create-subcription",verifyToken, createSubscription);
subscriptionRoutes.get("/active-subcription",verifyToken, getAllSubscriptions);
subscriptionRoutes.put("/:id",verifyToken, updateSubscription);
subscriptionRoutes.delete("/:id",verifyToken, deleteSubscription);

export default subscriptionRoutes;
