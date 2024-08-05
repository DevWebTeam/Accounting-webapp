import express from "express";
import {
    createNotification,
    getAllNotifications,
    getNotificationById,
    updateNotificationById,
    deleteNotificationById
} from "../controllers/notificationsControllers.js";



const router = express.Router();


router.get("/", getAllNotifications);

router.get("/notification", getNotificationById);

router.delete("/delete", deleteNotificatonById);





export default router;