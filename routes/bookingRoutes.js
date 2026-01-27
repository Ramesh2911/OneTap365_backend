import express from "express";
import {
  bookService,
  assignProvider,
  getAllBookings,
  getMyBookings,
  getProvidersByService,
  updateServicePrice,
} from "../controllers/bookingController.js";
import { verifyToken } from "../middleware/auth.js";

const bookingRoutes = express.Router();

bookingRoutes.post("/book-service", verifyToken, bookService);
bookingRoutes.put("/provider-assign", verifyToken, assignProvider);
bookingRoutes.get("/all-bookings", verifyToken, getAllBookings);
bookingRoutes.get("/my-bookings", verifyToken, getMyBookings);
bookingRoutes.get("/provider-names", verifyToken, getProvidersByService);
bookingRoutes.put("/price-update", verifyToken, updateServicePrice);

export default bookingRoutes;
