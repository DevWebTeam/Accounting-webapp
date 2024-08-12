import Notification from '../models/notification.js';

// Create a new notification
export const createNotification = async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        res.status(201).send(notification);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Get all notifications
export const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().populate('user');
        res.status(200).send(notifications);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Get a notification by ID
export const getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id).populate('user');
        if (!notification) {
            return res.status(404).send();
        }
        res.status(200).send(notification);
    } catch (error) {
        res.status(500).send(error);
    }
};


// Delete a notification by ID
export const deleteNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) {
            return res.status(404).send();
        }
        res.status(200).send(notification);
    } catch (error) {
        res.status(500).send(error);
    }
};

export default {
    createNotification,
    getAllNotifications,
    getNotificationById,
    deleteNotificationById
};