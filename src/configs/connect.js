import mongoose from 'mongoose';
import env from "dotenv";

env.config();

export const mongo = mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.error('Connection error', err);
    });

export default mongoose;