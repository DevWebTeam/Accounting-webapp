const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
title: {
    type: String,
    required: true
},
message: {
    type: String,
    required: true
},
user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
},
createdAt: {
    type: Date,
    default: Date.now
}
});

module.exports = mongoose.model('Notification', notificationSchema);