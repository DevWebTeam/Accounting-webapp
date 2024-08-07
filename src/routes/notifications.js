import express from "express";
import {
    deleteNotificationById,
    getAllNotifications,
    getNotificationById
} from "../controllers/notificationsControllers.js";



const router = express.Router();


router.get("/", getAllNotifications);

router.get("/notification/:id", getNotificationById);

router.delete("/delete/:id", deleteNotificationById);





export default router;