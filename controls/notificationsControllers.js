import Notification from '../models/notification.js';

// Create a new notification
const createNotification = async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        res.status(201).send(notification);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Get all notifications
const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().populate('user');
        res.status(200).send(notifications);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Get a notification by ID
const getNotificationById = async (req, res) => {
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

// Update a notification by ID
const updateNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('user');
        if (!notification) {
            return res.status(404).send();
        }
        res.status(200).send(notification);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Delete a notification by ID
const deleteNotificationById = async (req, res) => {
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
    updateNotificationById,
    deleteNotificationById
};
