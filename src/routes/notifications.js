import express from "express";
import {
    deleteNotificationById,
    getAllNotifications,
    getNotificationById
} from "../controllers/notificationsControllers.js";



const router = express.Router();


router.get("/", getAllNotifications);

router.get("/notification", getNotificationById);

router.delete("/delete", deleteNotificationById);





export default router;