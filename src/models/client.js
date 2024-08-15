import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
name: {
    type: String,
    required: true,
    unique: true
},
email: {
    type: String
},
number: {
    type: String
},
priorityCli: {
    type: Number,
    default: 100
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

export default mongoose.model('Client', clientSchema);