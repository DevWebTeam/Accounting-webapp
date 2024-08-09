import mongoose from "mongoose";
import Transaction from './transaction.js';

const clientschema = new mongoose.Schema({
name: {
    type: String,
    required: true,
    unique: true
},
number: {
    type: String
},
email: {
    type: String
},
priorityCli: {
    type: Number
},
group: {
    type: String
},
totalDebt: {
    type: Number,
    default: 0
},
totalCredit: {
    type: Number,
    default: 0
},
});

clientschema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    if (update.name) {
        const clientId = this.getQuery()._id;
        await Transaction.updateMany({ fromClient: clientId }, { fromClientName: update.name });
        await Transaction.updateMany({ toClient: clientId }, { toClientName: update.name });
    }
    next();
});

export default mongoose.model('Client', clientschema);