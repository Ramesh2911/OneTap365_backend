import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import subCategoriesRoutes from './routes/subcategoriesRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import serviceCategoriesRoutes from './routes/serviceCategoryRoutes.js';
import serviceSubCategoriesRoutes from './routes/serviceSubcategoryRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

config({
    path: './config.env'
});

const app = express();
app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.LOCAL_HOST],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use('/api', authRoutes);
app.use('/api', otpRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', subCategoriesRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api', itemRoutes);
app.use('/api', serviceCategoriesRoutes);
app.use('/api', serviceSubCategoriesRoutes);
app.use('/api', bookingRoutes);

export default app;
