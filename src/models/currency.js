import mongoose from 'mongoose';

const currencySchema = new mongoose.Schema({
    icon: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    nameInArabic: {
        type: String,
        required: true
    },
    // darb wla 9isma
    operation: {
        type: String,
        enum: ['multiply', 'divide'],
        required: true
    },
    priorityCu: {
        type: Number,
        required: true
    },
    priceInDollar: {
        type: Number,
        required: true
    },
    credit: {
        type: Number,
        required: true
    }
});

export default mongoose.model('Currency', currencySchema);