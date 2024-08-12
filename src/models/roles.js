import mongoose from "mongoose";


const rolesSchema = new mongoose.Schema({
    //currency
    addCurrency: {
        type: Boolean,
        default: false
    },
    confCurrency: {
        type: Boolean,
        default: false
    },
    dltCurrency: {
        type: Boolean,
        default: false
    },
    //settings
    viewSettings: {
        type: Boolean,
        default: false
    },
    confSettings: {
        type: Boolean,
        default: false
    },
    //user
    addUser: {
        type: Boolean,
        default: false
    },
    confUser: {
        type: Boolean,
        default: false
    },
    dltUser: {
        type: Boolean,
        default: false
    },
    //pages
    viewArchive: {
        type: Boolean,
        default: false
    },
    viewStats: {
        type: Boolean,
        default: false
    }
})

export default mongoose.model('roles', rolesSchema)