import mongoose from 'mongoose';
import Client from '../models/client.js';
import Currency from '../models/currency.js';
import Transaction from '../models/transaction.js';
import User from '../models/user.js';

// Function to limit the number of decimal places
const toShortNumber = (num, digits) => {
    return Number(num.toFixed(digits));
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

        // Ensure deptedForUs and creditForUs are numbers
        const deptedForUsNum = Number(deptedForUs);
        const creditForUsNum = Number(creditForUs);

        // Check if the conversion was successful
        if (isNaN(deptedForUsNum) || isNaN(creditForUsNum) || isNaN(fromCurrency.exchRate) || isNaN(toCurrency.exchRate)) {
            return res.status(400).send({ error: 'Invalid input data' });
        }

        // Perform calculations
        const resultInDollars = (creditForUsNum * fromCurrency.exchRate) - (deptedForUsNum * toCurrency.exchRate);

        // Limit the number of decimal places
        const shortResultInDollars = toShortNumber(resultInDollars, 2);

        // Ensure `results` is a valid number
        if (isNaN(shortResultInDollars)) {
            return res.status(400).send({ error: 'Invalid calculation for ResultInDollars' });
        }

        const transaction = new Transaction({
            _id: new mongoose.Types.ObjectId(),  // Ensure _id is in ObjectId format
            fromClient: fromClient._id,
            toClient: toClient._id,
            fromNameCurrency: fromCurrency._id,
            toNameCurrency: toCurrency._id,
            deptedForUs: deptedForUsNum,
            creditForUs: creditForUsNum,
            ResultInDollars: shortResultInDollars,
            description: description,
            type: type,
            user: user._id,
            date: Date.now()
        });

        await transaction.save();

        // Update client and currency balances with limited decimal places
        fromClient.totalCredit = toShortNumber(fromClient.totalCredit + (deptedForUsNum * fromCurrency.exchRate), 2);
        toClient.totalCredit = toShortNumber(toClient.totalCredit - (creditForUsNum * toCurrency.exchRate), 2);
        fromCurrency.credit = toShortNumber(fromCurrency.credit - deptedForUsNum, 2);
        toCurrency.credit = toShortNumber(toCurrency.credit + creditForUsNum, 2);

        await fromClient.save();
        await toClient.save();
        await fromCurrency.save();
        await toCurrency.save();

        res.status(201).send(transaction);
    } catch (error) {
        res.status(400).send(error);
    }
};

/* // Function to update a transaction by ID
export const updateTransactionById = async(req, res)=> {
    try {
        const {
            fromClientName, toClientName, fromCurrencyNameInArabic, toCurrencyNameInArabic, deptedForUs, creditForUs, description, type, userName
        } = req.body;

        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).send({ error: 'Transaction not found' });

        if (fromClientName) {
            const fromClient = await Client.findOne({ name: fromClientName });
            if (fromClient) transaction.fromClient = fromClient._id;
        }
        if (toClientName) {
            const toClient = await Client.findOne({ name: toClientName });
            if (toClient) transaction.toClient = toClient._id;
        }
        if (fromCurrencyNameInArabic) {
            const fromCurrency = await Currency.findOne({ nameInArabic: fromCurrencyNameInArabic });
            if (fromCurrency) transaction.fromNameCurrency = fromCurrency._id;
        }
        if (toCurrencyNameInArabic) {
            const toCurrency = await Currency.findOne({ nameInArabic: toCurrencyNameInArabic });
            if (toCurrency) transaction.toNameCurrency = toCurrency._id;
        }
        if (userName) {
            const user = await User.findOne({ username: userName });
            if (user) transaction.user = user._id;
        }

        if (deptedForUs !== undefined) transaction.deptedForUs = Number(deptedForUs);
        if (creditForUs !== undefined) transaction.creditForUs = Number(creditForUs);
        if (description) transaction.description = description;
        if (type) transaction.type = type;

        // Recalculate results
        const fromCurrency = await Currency.findById(transaction.fromNameCurrency);
        const toCurrency = await Currency.findById(transaction.toNameCurrency);

        if (fromCurrency && toCurrency) {
            const results = (transaction.creditForUs * fromCurrency.exchRate) - (transaction.deptedForUs * toCurrency.exchRate);
            transaction.ResultInDollars = results;
        }

        await transaction.save();

        res.status(200).send(transaction);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
}
// Function to get all transactions
export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('fromClient', 'name')
            .populate('toClient', 'name')
            .populate('fromNameCurrency', 'nameInArabic')
            .populate('toNameCurrency', 'nameInArabic')
            .populate('user', 'username');

        const formattedTransactions = transactions.map(transaction => ({
            ...transaction._doc,
            fromClientName: transaction.fromClient.name,
            toClientName: transaction.toClient.name,
            fromCurrencyNameInArabic: transaction.fromNameCurrency.nameInArabic,
            toCurrencyNameInArabic: transaction.toNameCurrency.nameInArabic,
            userName: transaction.user.username
        }));

        res.status(200).send(formattedTransactions);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Function to get a transaction by ID
export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('fromClient', 'name')
            .populate('toClient', 'name')
            .populate('fromNameCurrency', 'nameInArabic')
            .populate('toNameCurrency', 'nameInArabic')
            .populate('user', 'username');

        if (!transaction) return res.status(404).send({ error: 'Transaction not found' });

        const formattedTransaction = {
            ...transaction._doc,
            fromClientName: transaction.fromClient.name,
            toClientName: transaction.toClient.name,
            fromCurrencyNameInArabic: transaction.fromNameCurrency.nameInArabic,
            toCurrencyNameInArabic: transaction.toNameCurrency.nameInArabic,
            userName: transaction.user.username
        };

        res.status(200).send(formattedTransaction);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Function to get transactions by currency
export const getTransactionsByCurrency = async (req, res) => {
    try {
        const { currencyNameInArabic } = req.params;

        const currency = await Currency.findOne({ nameInArabic: currencyNameInArabic });
        if (!currency) return res.status(404).send({ error: 'Currency not found' });

        const transactions = await Transaction.find({
            $or: [
                { fromNameCurrency: currency._id },
                { toNameCurrency: currency._id }
            ]
        })
        .populate('fromClient', 'name')
        .populate('toClient', 'name')
        .populate('fromNameCurrency', 'nameInArabic')
        .populate('toNameCurrency', 'nameInArabic')
        .populate('user', 'username');

        const formattedTransactions = transactions.map(transaction => ({
            ...transaction._doc,
            fromClientName: transaction.fromClient.name,
            toClientName: transaction.toClient.name,
            fromCurrencyNameInArabic: transaction.fromNameCurrency.nameInArabic,
            toCurrencyNameInArabic: transaction.toNameCurrency.nameInArabic,
            userName: transaction.user.username
        }));

        res.status(200).send(formattedTransactions);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Function to get transactions by client
export const getTransactionsByClient = async (req, res) => {
    try {
        const { clientName } = req.params;

        const client = await Client.findOne({ name: clientName });
        if (!client) return res.status(404).send({ error: 'Client not found' });

        const transactions = await Transaction.find({
            $or: [
                { fromClient: client._id },
                { toClient: client._id }
            ]
        })
        .populate('fromClient', 'name')
        .populate('toClient', 'name')
        .populate('fromNameCurrency', 'nameInArabic')
        .populate('toNameCurrency', 'nameInArabic')
        .populate('user', 'username');

        const formattedTransactions = transactions.map(transaction => ({
            ...transaction._doc,
            fromClientName: transaction.fromClient.name,
            toClientName: transaction.toClient.name,
            fromCurrencyNameInArabic: transaction.fromNameCurrency.nameInArabic,
            toCurrencyNameInArabic: transaction.toNameCurrency.nameInArabic,
            userName: transaction.user.username
        }));

        res.status(200).send(formattedTransactions);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Function to update a transaction by ID
export const updateyId = async (req, res) => {
    try {
        const {
            fromClientName,
            toClientName,
            fromCurrencyNameInArabic,
            toCurrencyNameInArabic,
            deptedForUs,
            creditForUs,
            description,
            type,
            userName
        } = req.body;

        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).send({ error: 'Transaction not found' });

        if (fromClientName) {
            const fromClient = await Client.findOne({ name: fromClientName });
            if (fromClient) transaction.fromClient = fromClient._id;
        }
        if (toClientName) {
            const toClient = await Client.findOne({ name: toClientName });
            if (toClient) transaction.toClient = toClient._id;
        }
        if (fromCurrencyNameInArabic) {
            const fromCurrency = await Currency.findOne({ nameInArabic: fromCurrencyNameInArabic });
            if (fromCurrency) transaction.fromNameCurrency = fromCurrency._id;
        }
        if (toCurrencyNameInArabic) {
            const toCurrency = await Currency.findOne({ nameInArabic: toCurrencyNameInArabic });
            if (toCurrency) transaction.toNameCurrency = toCurrency._id;
        }
        if (userName) {
            const user = await User.findOne({ username: userName });
            if (user) transaction.user = user._id;
        }

        if (deptedForUs !== undefined) transaction.deptedForUs = Number(deptedForUs);
        if (creditForUs !== undefined) transaction.creditForUs = Number(creditForUs);
        if (description) transaction.description = description;
        if (type) transaction.type = type;

        // Recalculate results
        const fromCurrency = await Currency.findById(transaction.fromNameCurrency);
        const toCurrency = await Currency.findById(transaction.toNameCurrency);

        if (fromCurrency && toCurrency) {
            const results = (transaction.creditForUs * fromCurrency.exchRate) - (transaction.deptedForUs * toCurrency.exchRate);
            transaction.ResultInDollars = results;
        }

        await transaction.save();

        res.status(200).send(transaction);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// Function to get transactions by client and group by currency
export const getTransactionsByClientGroupedByCurrency = async (req, res) => {
    try {
        const clientName = req.params.clientName;

        const client = await Client.findOne({ name: clientName });
        if (!client) return res.status(404).send({ error: 'Client not found' });

        const transactions = await Transaction.aggregate([
            {
                $lookup: {
                    from: 'currencies',
                    localField: 'fromNameCurrency',
                    foreignField: '_id',
                    as: 'fromCurrency'
                }
            },
            {
                $lookup: {
                    from: 'currencies',
                    localField: 'toNameCurrency',
                    foreignField: '_id',
                    as: 'toCurrency'
                }
            },
            {
                $lookup: {
                    from: 'clients',
                    localField: 'fromClient',
                    foreignField: '_id',
                    as: 'fromClient'
                }
            },
            {
                $lookup: {
                    from: 'clients',
                    localField: 'toClient',
                    foreignField: '_id',
                    as: 'toClient'
                }
            },
            { $unwind: '$fromCurrency' },
            { $unwind: '$toCurrency' },
            { $unwind: '$fromClient' },
            { $unwind: '$toClient' },
            {
                $match: {
                    $or: [
                        { fromClient: client._id },
                        { toClient: client._id }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        fromCurrency: { $cond: [{ $eq: ['$fromClient._id', client._id] }, '$fromCurrency.nameInArabic', null] },
                        toCurrency: { $cond: [{ $eq: ['$toClient._id', client._id] }, '$toCurrency.nameInArabic', null] }
                    },
                    totalDebtedForUs: {
                        $sum: {
                            $cond: [{ $eq: ['$fromClient._id', client._id] }, '$deptedForUs', 0]
                        }
                    },
                    totalCreditForUs: {
                        $sum: {
                            $cond: [{ $eq: ['$toClient._id', client._id] }, '$creditForUs', 0]
                        }
                    },
                    transactions: {
                        $push: {
                            _id: '$_id',
                            fromClientName: '$fromClient.name',
                            toClientName: '$toClient.name',
                            fromCurrencyNameInArabic: '$fromCurrency.nameInArabic',
                            toCurrencyNameInArabic: '$toCurrency.nameInArabic',
                            userName: '$user.username',
                            deptedForUs: '$deptedForUs',
                            creditForUs: '$creditForUs',
                            description: '$description',
                            type: '$type',
                            results: '$ResultInDollars',
                            date: '$date'
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    currency: {
                        $cond: {
                            if: { $ne: ['$_id.fromCurrency', null] },
                            then: '$_id.fromCurrency',
                            else: '$_id.toCurrency'
                        }
                    },
                    totalDebtedForUs: 1,
                    totalCreditForUs: 1,
                    transactions: 1
                }
            },
            { $sort: { 'currency': 1 } }
        ]);

        res.status(200).send(transactions);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Function to archive a transaction by ID
export const archiveTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).send({ error: 'Transaction not found' });

        transaction.archived = true;
        await transaction.save();

        res.status(200).send(transaction);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// Function to unarchive a transaction by ID
export const unarchiveTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).send({ error: 'Transaction not found' });

        transaction.archived = false;
        await transaction.save();

        res.status(200).send(transaction);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// Function to delete a transaction by ID
export const deleteTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!transaction) return res.status(404).send({ error: 'Transaction not found' });

        res.status(200).send(transaction);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}; */
