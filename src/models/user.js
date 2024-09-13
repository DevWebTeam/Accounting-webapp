import mongoose from 'mongoose';



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    number: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'user'],
        default: "user",
        required: true
    },
    banned: {
        type: Boolean,
        default: false,
    }
});

export default mongoose.model('User', userSchema);