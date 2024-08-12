import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    priority: {
        type: Number,
        default: 100
    }
});


export default mongoose.model('group', groupSchema);