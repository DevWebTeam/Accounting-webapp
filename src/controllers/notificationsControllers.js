import Notification from '../models/notification.js';

export const createNotification = async (username, title , message) => {
    const notification = new Notification({
        user: username,
        title: title,
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


export const getAllNotifications = async (req, res) => {
    if (req.isAuthenticated()) {
        let notifications = await Notification.find();
        notifications = notifications.reverse();

        res.render('notifications.ejs', {notifications: notifications, userName: req.session.passport.user.userName});

    } else {
        res.redirect('/login');
    }
}


export default {
    createNotification,
    getAllNotifications
};