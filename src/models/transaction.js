import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
fromClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
},
fromClientName: {
    type: String,
    required: true
},
toClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
},
toClientName: {
    type: String,
    required: true
},
fromCurrency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Currency',
},
fromNameCurrency: {
    type: String,
    required: true
},
toCurrency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Currency',
},
toNameCurrency: {
    type: String,
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
},
userName:{
    type:String,
    required:true,
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
},
transactionNumber: {
    type: Number,
    required: true,
    },
isCanceled:{
    type:Boolean,
    default: false,
    required: true,
},
CancelID: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
},
checked: {
    type: Boolean,
    required: true,
    default: false,
},
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;