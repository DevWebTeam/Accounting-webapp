import Notification from '../models/notification.js';

export const createNotification = async (userId, message) => {
    const notification = new Notification({
        user: userId,
        message: message,
        date: new Date().toLocaleString("en-US", {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }),
    });

    await notification.save();
};

export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user._id;  // Assuming you have user authentication in place
        const notifications = await Notification.find({ user: userId }).sort({ date: -1 });

        res.status(200).send(notifications);
    } catch (error) {
        res.status(500).send(error);
    }
};


export default {createNotification};