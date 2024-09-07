import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    date: { type: String, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;