import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
fromClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
},
toClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
},
fromNameCurrency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Currency',
    required: true
},
toNameCurrency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Currency',
    required: true
},
deptedForUs: {
    type: Number,
    required: true
},
creditForUs: {
    type: Number,
    required: true
},

ResultInDollars: {
    type: Number,
},
description: {
    type: String,
    required: true
},
user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
},
date: {
    type: Date,
    default: Date.now
},
type: {
    type: String,
    required: true
},
archived: {
    type: Boolean,
    default: false
}
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;