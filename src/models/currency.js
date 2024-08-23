import mongoose from 'mongoose';
import Transaction from './transaction.js';

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
        required: true,
        unique: true
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
        default:0,
    }
});

currencySchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    if (update.nameInArabic) {
        const currencyId = this.getQuery()._id;
        await Transaction.updateMany({ fromCurrency: currencyId }, { fromNameCurrency: update.nameInArabic });
        await Transaction.updateMany({ toCurrency: currencyId }, { toNameCurrency: update.nameInArabic });
    }
    next();
});
export default mongoose.model('Currency', currencySchema);