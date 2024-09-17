import mongoose from 'mongoose';
import Transaction from './transaction.js';

const CurrencySchema = new mongoose.Schema({
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
        default: 100,
    },
    exchRate: {
        type: Number,
        required: true
    },
    credit: {
        type: Number,
        default: 0,
    },
    isDefault: {
        type: Boolean,
        default: false,
    }
});

// Define the static method on the schema
CurrencySchema.statics.ensureDefaultCurrency1 = async function() {
    const defaultCurrencyName2 = "دولار أمريكي";
    let defaultCurrency = await this.findOne({ nameInArabic: defaultCurrencyName2 });

    if (!defaultCurrency) {
        defaultCurrency = new this({
            nameInArabic: defaultCurrencyName2,
            isDefault: true,
            exchRate: 1,
            nameInEnglish: "dollar",
            priorityCu: 1,
            symbol: "$",
            code: "USD"
        });
        await defaultCurrency.save();
    }
};

// Pre-update hook to update the nameInArabic in related transactions
CurrencySchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    if (update.nameInArabic) {
        const currencyId = this.getQuery()._id;
        await Transaction.updateMany({ fromCurrency: currencyId }, { fromNameCurrency: update.nameInArabic });
        await Transaction.updateMany({ toCurrency: currencyId }, { toNameCurrency: update.nameInArabic });
    }
    next();
});

// Compile the model
const Currency = mongoose.model('Currency', CurrencySchema);

// Now call ensureDefaultCurrency1 after the model has been compiled
Currency.ensureDefaultCurrency1().catch(console.error);

export default Currency;
