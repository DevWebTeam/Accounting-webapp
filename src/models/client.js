import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
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

export default mongoose.model('Client', clientschema);