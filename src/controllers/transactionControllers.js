import Client from '../models/client.js';
import Counter from '../models/counter.js';
import Currency from '../models/currency.js';
import Transaction from '../models/transaction.js';
import User from '../models/user.js';


// Get next sequence value
const getNextSequenceValue = async (sequenceName) => {
    const sequenceDocument = await Counter.findByIdAndUpdate(
        sequenceName,
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );
    return sequenceDocument.sequence_value;
};


// Create a new transaction
export const createTransaction = async (req, res) => {
    try {
        const { fromClientName, toClientName, fromCurrencyNameInArabic, toCurrencyNameInArabic, deptedForUs, creditForUs, description, type, userName } = req.body;

        const fromClient = await Client.findOne({ name: fromClientName });
        const toClient = await Client.findOne({ name: toClientName });

        if (!fromClient || !toClient) {
            return res.status(404).send({ error: 'Client not found' });
        }

        const fromCurrency = await Currency.findOne({ nameInArabic: fromCurrencyNameInArabic });
        const toCurrency = await Currency.findOne({ nameInArabic: toCurrencyNameInArabic });

        if (!fromCurrency || !toCurrency) {
            return res.status(404).send({ error: 'Currency not found' });
        }

        const user = await User.findOne({ username: userName });
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        const results = (creditForUs * fromCurrency.exchRate) - (deptedForUs * toCurrency.exchRate);

        const nextId = await getNextSequenceValue('transactionId');

        const transaction = new Transaction({
            _id: nextId,
            fromClient: fromClient._id,
            toClient: toClient._id,
            fromCurrency: fromCurrency._id,
            toCurrency: toCurrency._id,
            user: user._id,
            deptedForUs,
            creditForUs,
            description,
            type,
            results,
            date: Date.now()
        });

        await transaction.save();

        fromClient.totalCredit += deptedForUs * fromCurrency.exchRate;
        toClient.totalCredit -= creditForUs * toCurrency.exchRate;
        fromCurrency.credit -= deptedForUs;
        toCurrency.credit += creditForUs;

        await fromClient.save();
        await toClient.save();
        await fromCurrency.save();
        await toCurrency.save();

        res.status(201).send(transaction);
    } catch (error) {
        res.status(400).send(error);
    }
};


// Get all transactions
export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('fromClient', 'name')
            .populate('toClient', 'name')
            .populate('fromCurrency', 'nameInArabic')
            .populate('toCurrency', 'nameInArabic')
            .populate('user', 'username');

        const formattedTransactions = transactions.map(transaction => ({
            ...transaction._doc,
            fromClientName: transaction.fromClient.name,
            toClientName: transaction.toClient.name,
            fromCurrencyNameInArabic: transaction.fromCurrency.nameInArabic,
            toCurrencyNameInArabic: transaction.toCurrency.nameInArabic,
            userName: transaction.user.username
        }));

        res.status(200).send(formattedTransactions);
    } catch (error) {
        res.status(500).send(error);
    }
};


// Get a transaction by ID
export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('fromClient', 'name')
            .populate('toClient', 'name')
            .populate('fromCurrency', 'nameInArabic')
            .populate('toCurrency', 'nameInArabic')
            .populate('user', 'username');

        if (!transaction) {
            return res.status(404).send();
        }

        const formattedTransaction = {
            ...transaction._doc,
            fromClientName: transaction.fromClient.name,
            toClientName: transaction.toClient.name,
            fromCurrencyNameInArabic: transaction.fromCurrency.nameInArabic,
            toCurrencyNameInArabic: transaction.toCurrency.nameInArabic,
            userName: transaction.user.username
        };

        res.status(200).send(formattedTransaction);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Get transactions by currency
export const getTransactionsByCurrency = async (req, res) => {
    try {
        const { currencyNameInArabic } = req.params;

        // Find the currency by its name in Arabic
        const currency = await Currency.findOne({ nameInArabic: currencyNameInArabic });

        if (!currency) {
            return res.status(404).send({ error: 'Currency not found' });
        }

        // Find all transactions involving the currency
        const transactions = await Transaction.find({
            $or: [
                { fromCurrency: currency._id },
                { toCurrency: currency._id }
            ]
        })
        .populate('fromClient', 'name')
        .populate('toClient', 'name')
        .populate('fromCurrency', 'nameInArabic')
        .populate('toCurrency', 'nameInArabic')
        .populate('user', 'name');

        const formattedTransactions = transactions.map(transaction => ({
            ...transaction._doc,
            fromClientName: transaction.fromClient.name,
            toClientName: transaction.toClient.name,
            fromCurrencyNameInArabic: transaction.fromCurrency.nameInArabic,
            toCurrencyNameInArabic: transaction.toCurrency.nameInArabic,
            userName: transaction.user.name
        }));

        res.status(200).send(formattedTransactions);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Get transactions by client
export const getTransactionsByClient = async (req, res) => {
    try {
        const { clientName } = req.params;

        // Find the client by its name
        const client = await Client.findOne({ name: clientName });

        if (!client) {
            return res.status(404).send({ error: 'Client not found' });
        }

        // Find all transactions involving the client
        const transactions = await Transaction.find({
            $or: [
                { fromClient: client._id },
                { toClient: client._id }
            ]
        })
        .populate('fromClient', 'name')
        .populate('toClient', 'name')
        .populate('fromCurrency', 'nameInArabic')
        .populate('toCurrency', 'nameInArabic')
        .populate('user', 'name');

        const formattedTransactions = transactions.map(transaction => ({
            ...transaction._doc,
            fromClientName: transaction.fromClient.name,
            toClientName: transaction.toClient.name,
            fromCurrencyNameInArabic: transaction.fromCurrency.nameInArabic,
            toCurrencyNameInArabic: transaction.toCurrency.nameInArabic,
            userName: transaction.user.name
        }));

        res.status(200).send(formattedTransactions);
    } catch (error) {
        res.status(500).send(error);
    }
};


// Update a transaction by ID
export const updateTransactionById = async (req, res) => {
    try {
        const { fromClientName, toClientName, fromCurrencyNameInArabic, toCurrencyNameInArabic, deptedForUs, creditForUs, description, type, userName } = req.body;

        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).send();
        }

        const fromClient = await Client.findOne({ name: fromClientName });
        const toClient = await Client.findOne({ name: toClientName });

        if (fromClient) transaction.fromClient = fromClient._id;
        if (toClient) transaction.toClient = toClient._id;

        const fromCurrency = await Currency.findOne({ nameInArabic: fromCurrencyNameInArabic });
        const toCurrency = await Currency.findOne({ nameInArabic: toCurrencyNameInArabic });

        if (fromCurrency) transaction.fromCurrency = fromCurrency._id;
        if (toCurrency) transaction.toCurrency = toCurrency._id;

        const user = await User.findOne({ username: userName });
        if (user) transaction.user = user._id;

        if (deptedForUs !== undefined) transaction.deptedForUs = deptedForUs;
        if (creditForUs !== undefined) transaction.creditForUs = creditForUs;
        if (description) transaction.description = description;
        if (type) transaction.type = type;

        const results = (transaction.creditForUs * fromCurrency.exchRate) - (transaction.deptedForUs * toCurrency.exchRate);
        transaction.results = results;

        await transaction.save();

        res.status(200).send(transaction);
    } catch (error) {
        res.status(400).send(error);
    }
};



// Archive a transaction by ID
export const archiveTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).send();
        }
        transaction.archived = true;
        await transaction.save();
        res.status(200).send(transaction);
    } catch (error) {
        res.status(400).send(error);
    }
};



// Unarchive a transaction by ID
export const unarchiveTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).send();
        }
        transaction.archived = false;
        await transaction.save();
        res.status(200).send(transaction);
    } catch (error) {
        res.status(400).send(error);
    }
};



// Delete a transaction by ID
export const deleteTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!transaction) {
            return res.status(404).send();
        }
        res.status(200).send(transaction);
    } catch (error) {
        res.status(500).send(error);
    }
};
