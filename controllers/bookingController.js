import db from "../db/db.js";
import { io } from "../server.js";

// Generate unique booking ID
const generateBookingId = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Financial year calculation (April–March)
    const fyStart = month >= 4 ? year : year - 1;
    const fyEnd = fyStart + 1;

    // last 2 digits of years → 27 + 28 = 2728
    const financialYear =
        fyStart.toString().slice(-2) + fyEnd.toString().slice(-2);

    // random 2 digit number
    const randomTwoDigit = Math.floor(10 + Math.random() * 90);

    return `OT-${financialYear}${randomTwoDigit}`;
};

// Book a service
export const bookService = async (req, res) => {
    try {
        const {
            service_cat_id,
            service_subcat_id,
            service_date,
            service_time,
            address,
            pincode,
        } = req.body;

        const customer_id = req.user.id;

        if (
            !service_cat_id ||
            !service_subcat_id ||
            !service_date ||
            !service_time ||
            !address ||
            !pincode
        ) {
            return res.status(400).json({
                success: false,
                message: "All booking fields are required",
            });
        }

        const bookingId = generateBookingId();

        await db.query(
            `INSERT INTO service_bookings
      (
        booking_id,
        customer_id,
        service_cat_id,
        service_subcat_id,
        service_date,
        service_time,
        address,
        pincode,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
            [
                bookingId,
                customer_id,
                service_cat_id,
                service_subcat_id,
                service_date,
                service_time,
                address,
                pincode,
            ]
        );

        await db.query(
            `INSERT INTO notifications (user_id, title, message)
       VALUES (?, ?, ?)`,
            [1, "New Service Booking", `New booking received (${bookingId})`]
        );

        io.to("user_1").emit("new_booking", {
            booking_id: bookingId,
            message: "New service booking received",
        });

        res.status(200).json({
            success: true,
            message: "Service booked successfully",
            booking_id: bookingId,
        });
    } catch (error) {
        console.error("Book Service Error:", error);
        res.status(500).json({
            success: false,
            message: "Service booking failed",
        });
    }
};

// Assign a service provider to a booking
export const assignProvider = async (req, res) => {
    try {
        const { booking_id, provider_id } = req.body;
        console.log("BODY:", req.body);
        await db.query(
            `UPDATE service_bookings
       SET provider_id = ?, status = 'ASSIGNED'
       WHERE booking_id = ?`,
            [provider_id, booking_id]
        );

        await db.query(
            `INSERT INTO notifications (user_id, title, message)
       VALUES (?, 'Service Assigned', ?)`,
            [provider_id, `You are assigned booking ${booking_id}`]
        );

        io.to(`user_${provider_id}`).emit("service_assigned", {
            booking_id,
            message: "You have been assigned a service",
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

// All bookings (Admin)
export const getAllBookings = async (req, res) => {
    try {
        const [rows] = await db.query(
            `
      SELECT 
        sb.id,
        sb.booking_id,
        sb.service_date,
        sb.service_time,
        sb.address,
        sb.pincode,
        sb.status,
        sb.service_price,
        sb.created_at,

        sb.service_cat_id,
        sc.name AS service_category_name,

        sb.service_subcat_id,
        ssc.name AS service_subcategory_name,

        u.name AS customer_name,
        u.phone AS customer_phone

      FROM service_bookings sb
      JOIN users u 
        ON sb.customer_id = u.id

      LEFT JOIN service_categories sc 
        ON sb.service_cat_id = sc.id

      LEFT JOIN service_subcategories ssc 
        ON sb.service_subcat_id = ssc.id

      ORDER BY sb.created_at DESC
      `
        );

        if (rows.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No booking data found",
            });
        }

        res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("Get All Bookings Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
        });
    }
};

// My bookings (Customer)
export const getMyBookings = async (req, res) => {
    try {
        const customer_id = req.user.id;

        const [rows] = await db.query(
            `
      SELECT 
        sb.id,
        sb.booking_id,
        sb.service_date,
        sb.service_time,
        sb.address,
        sb.pincode,
        sb.status,
        sb.service_price,
        sb.created_at,

        sb.service_cat_id,
        sc.name AS service_category_name,

        sb.service_subcat_id,
        ssc.name AS service_subcategory_name

      FROM service_bookings sb

      LEFT JOIN service_categories sc 
        ON sb.service_cat_id = sc.id

      LEFT JOIN service_subcategories ssc 
        ON sb.service_subcat_id = ssc.id

      WHERE sb.customer_id = ?
      ORDER BY sb.created_at DESC
      `,
            [customer_id]
        );

        if (rows.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No booking data found",
            });
        }

        res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("Get My Bookings Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
        });
    }
};

// Get providers by service category and subcategory
export const getProvidersByService = async (req, res) => {
    try {
        const { service_cat_id, service_subcat_id } = req.query;

        if (!service_cat_id || !service_subcat_id) {
            return res.status(400).json({
                success: false,
                message: "service category and service subcategory are required",
            });
        }

        const [rows] = await db.query(
            `
      SELECT id, name
      FROM users
      WHERE role_id = 3
        AND service_cat_id = ?
        AND FIND_IN_SET(?, service_subcat_id)
        AND status = 'ACTIVE'
      `,
            [service_cat_id, service_subcat_id]
        );

        if (rows.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No provider found",
            });
        }

        res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("Get Providers Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch providers",
        });
    }
};

// Update service price by provider
export const updateServicePrice = async (req, res) => {
    try {
        const { booking_id, service_price } = req.body;
        const provider_id = req.user.id;

        await db.query(
            `UPDATE service_bookings
       SET service_price = ?, status = 'PRICE_DECIDED'
       WHERE booking_id = ? AND provider_id = ?`,
            [service_price, booking_id, provider_id]
        );

        io.to("user_1").emit("price_decided", {
            booking_id,
            service_price,
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};


