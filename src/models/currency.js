import mongoose from 'mongoose';

const currencySchema = new mongoose.Schema({
    icon: {
        type: String
    },
    nameInEnglish: {
        type: String,
        required: true
    },
    nameInArabic: {
        type: String,
        required: true
    },
    code: {
        type: String,
        maxlength: 3,
        set: v => v.toUpperCase(),
        required: true
    },
    symbol: {
        type: String,
        maxlength: 3,
        set: v => v.toUpperCase(),
        required: true
    },
    priorityCu: {
        type: Number,
        default: 100
    },
    exchRate: {
        type: Number,
        required: true
    },
    credit: {
    type: Number,
    }
});

export default mongoose.model('Currency', currencySchema);