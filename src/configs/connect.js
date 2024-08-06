import mongoose from 'mongoose';

export const mongo = mongoose.connect('mongodb://127.0.0.1:27017/Financify')
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.error('Connection error', err);
    });

export default mongoose;