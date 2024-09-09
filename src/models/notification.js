import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: { type: String, required: true },
    title: {type: String, required: true},
    message: { type: String, required: true },
    date: { type: String, default: Date.now },
    read: { type: Boolean, default: false }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;