import mongoose from "mongoose";
import Transaction from './transaction.js';


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
isDefault: {  // Added field to mark default clients
    type: Boolean,
    default: false
}
});

// export default mongoose.model('Client', clientSchema);


// Middleware to update transaction references
clientSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    if (update.name) {
        const clientId = this.getQuery()._id;
        await Transaction.updateMany({ fromClient: clientId }, { fromClientName: update.name });
        await Transaction.updateMany({ toClient: clientId }, { toClientName: update.name });
    }
    next();
});

// Middleware to prevent deletion of default client
clientSchema.pre('findOneAndDelete', async function(next) {
    const client = await this.model.findOne(this.getQuery());
    if (client && client.isDefault) {
        return next(new Error('Default client cannot be deleted'));
    }
    next();
});

// Function to ensure default client exists
clientSchema.statics.ensureDefaultClient = async function() {
    const defaultClientName = "ارباح و الخسائر";
    let defaultClient = await this.findOne({ name: defaultClientName });

    if (!defaultClient) {
        defaultClient = new this({
            name: defaultClientName,
            isDefault: true,
            group: 'حسابات سرية',
            priorityCli: 1,
        });


        await defaultClient.save();
    }
};
clientSchema.statics.ensureDefaultClient1 = async function() {
    const defaultClientName1 = "ارباح و الخسائر يومية";
    let defaultClient = await this.findOne({ name: defaultClientName1 });

    if (!defaultClient) {
        defaultClient = new this({
            name: defaultClientName1,
            isDefault: true,
            group: 'حسابات سرية',
            priorityCli: 1,
        });


        await defaultClient.save();
    }
};

// Create the model
const Client = mongoose.model('Client', clientSchema);

// Ensure the default client exists on application startup
Client.ensureDefaultClient().catch(console.error);
Client.ensureDefaultClient1().catch(console.error);

export default Client;