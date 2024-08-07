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
        required: true
    },
    // darb wla 9isma
    /* operation: {
        type: String,
        enum: ['multiply', 'divide'],
        required: true
    }, */
    priorityCu: {
        type: Number,
        required: true
    },
    exchRate: {
        type: Number,
        required: true
    },
    credit: {
        type: Number,
        required: true
    }
});

export default mongoose.model('Currency', currencySchema);