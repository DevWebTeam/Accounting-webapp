const mongoose = require('mongoose');

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
deptedForUsDollars: {
    type: Number,
    required: true
},
creditForUsDollars: {
    type: Number,
    required: true
},
        //natij mo9awam
ResultInDollars: {
    type: Number,
    required: true
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
date:{
    type: Date,
    default: Date.now
},
type:{
    type:String,
    required:true
},
archived: {
    type: Boolean,
    default: false}
});

module.exports = mongoose.model('Transaction', transactionSchema);
