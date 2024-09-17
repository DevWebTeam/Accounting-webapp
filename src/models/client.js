import mongoose from 'mongoose';
import Transaction from './transaction.js';

// Define the schema for Client
const ClientSchema = new mongoose.Schema({
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
    isDefault: {  // Added field to mark default clients
        type: Boolean,
        default: false
    }
});

// Middleware to update transaction references
ClientSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    if (update.name) {
        const clientId = this.getQuery()._id;
        await Transaction.updateMany({ fromClient: clientId }, { fromClientName: update.name });
        await Transaction.updateMany({ toClient: clientId }, { toClientName: update.name });
    }
    next();
});

// Middleware to prevent deletion of default client
ClientSchema.pre('findOneAndDelete', async function(next) {
    const client = await this.model.findOne(this.getQuery());
    if (client && client.isDefault) {
        return next(new Error('Default client cannot be deleted'));
    }
    next();
});

// Function to ensure default client exists
ClientSchema.statics.ensureDefaultClient = async function() {
    const defaultClientName = "ارباح و الخسائر";
    let defaultClient = await this.findOne({ name: defaultClientName });

    if (!defaultClient) {
        defaultClient = new this({
            name: defaultClientName,
            priorityCli: 1,
            group: 'حسابات اساسيه',
            isDefault: true
        });
        await defaultClient.save();
    }
};

ClientSchema.statics.ensureDefaultClient1 = async function() {
    const defaultClientName1 = "ارباح و الخسائر يومية";
    let defaultClient = await this.findOne({ name: defaultClientName1 });

    if (!defaultClient) {
        defaultClient = new this({
            name: defaultClientName1,
            priorityCli: 1,
            group: 'حسابات اساسيه',
            isDefault: true
        });
        await defaultClient.save();
    }
};
ClientSchema.statics.ensureDefaultClient2 = async function() {
    const defaultClientName2 = "حسابات متعددة";
    let defaultClient = await this.findOne({ name: defaultClientName2 });

    if (!defaultClient) {
        defaultClient = new this({
            name: defaultClientName2,
            priorityCli: 1,
            group: 'حسابات اساسيه',
            isDefault: true,
            //unseen:true//
        });
        await defaultClient.save();
    }
};
// Create the model
const Client = mongoose.model('Client', ClientSchema);

// Ensure the default client exists on application startup
Client.ensureDefaultClient().catch(console.error);
Client.ensureDefaultClient1().catch(console.error);
Client.ensureDefaultClient2().catch(console.error);

export default Client;