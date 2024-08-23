import mongoose from 'mongoose';
import Client from '../models/client.js';
import Currency from '../models/currency.js';
import Transaction from '../models/transaction.js';
import User from '../models/user.js';
import createNotification from './notificationsControllers.js';

// Function to limit the number of decimal places
const toShortNumber = (num, digits) => {
    return Number(num.toFixed(digits));
};

const generateTransactionNumber = async () => {
    const lastTransaction = await Transaction.findOne().sort({ transactionNumber: -1 }).exec();
    return lastTransaction ? lastTransaction.transactionNumber + 1 : 1;
};


// Create
export const createTransaction = async (req, res) => {
    try {
        const { fromClientName, toClientName, fromCurrencyNameInArabic, toCurrencyNameInArabic,deptedForUsNum ,creditForUsNum , description, type, userName } = req.body;

        const fromClient = await Client.findOne({ name: fromClientName });
        const toClient = await Client.findOne({ name: toClientName });


        const fromCurrency = await Currency.findOne({ nameInArabic: fromCurrencyNameInArabic });
        const toCurrency = await Currency.findOne({ nameInArabic: toCurrencyNameInArabic });


        const user = await User.findOne({ username: userName });


        const resultInDollars = (creditForUsNum * fromCurrency.exchRate) - (deptedForUsNum * toCurrency.exchRate);

        const shortResultInDollars = toShortNumber(resultInDollars, 2);

        const transactionNumber = await generateTransactionNumber();

        const transaction = new Transaction({
            _id: new mongoose.Types.ObjectId(),
            fromClient: fromClient._id,
            toClient: toClient._id,
            fromCurrency: fromCurrency._id,
            toCurrency: toCurrency._id,
            deptedForUs: deptedForUsNum,
            creditForUs: creditForUsNum,
            ResultInDollars: shortResultInDollars,
            description: description,
            type: type,
            date: Date.now(),
            fromClientName:fromClientName,
            toClientName:toClientName,
            fromNameCurrency:fromCurrencyNameInArabic,
            toNameCurrency:toCurrencyNameInArabic,
            user:user._id,
            userName:userName,
            transactionNumber: transactionNumber,
        });

        await transaction.save();

        fromClient.totalDebt = toShortNumber(fromClient.totalDebt + (creditForUsNum * fromCurrency.exchRate), 2);
        toClient.totalCredit = toShortNumber(toClient.totalCredit + (deptedForUsNum * toCurrency.exchRate), 2);
        fromCurrency.credit = toShortNumber(fromCurrency.credit + creditForUsNum, 2);
        toCurrency.credit = toShortNumber(toCurrency.credit - deptedForUsNum, 2);

        await fromClient.save();
        await toClient.save();
        await fromCurrency.save();
        await toCurrency.save();

        res.status(201).send(transaction);
    } catch (error) {
        res.status(400).send(error);
    }
};


export const updateTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const { fromClientName, toClientName, fromCurrencyNameInArabic, toCurrencyNameInArabic, deptedForUsNum, creditForUsNum, description, type, userName } = req.body;

        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).send({ error: 'Transaction not found' });
        }

        const fromClient = await Client.findOne({ name: fromClientName });
        const toClient = await Client.findOne({ name: toClientName });
        const fromCurrency = await Currency.findOne({ nameInArabic: fromCurrencyNameInArabic });
        const toCurrency = await Currency.findOne({ nameInArabic: toCurrencyNameInArabic });
        const user = await User.findOne({ username: userName });

        const oldFromClient = await Client.findById(transaction.fromClient);
        const oldToClient = await Client.findById(transaction.toClient);
        const oldFromCurrency = await Currency.findById(transaction.fromCurrency);
        const oldToCurrency = await Currency.findById(transaction.toCurrency);

        oldFromClient.totalDebt = toShortNumber(oldFromClient.totalDebt - (transaction.creditForUs * oldFromCurrency.exchRate), 2);
        oldToClient.totalCredit = toShortNumber(oldToClient.totalCredit - (transaction.deptedForUs * oldToCurrency.exchRate), 2);
        oldFromCurrency.credit = toShortNumber(oldFromCurrency.credit - transaction.deptedForUs, 2);
        oldToCurrency.credit = toShortNumber(oldToCurrency.credit + transaction.creditForUs, 2);

        await oldFromClient.save();
        await oldToClient.save();
        await oldFromCurrency.save();
        await oldToCurrency.save();

        const resultInDollars = (creditForUsNum * fromCurrency.exchRate) - (deptedForUsNum * toCurrency.exchRate);
        const shortResultInDollars = toShortNumber(resultInDollars, 2);

        transaction.fromClient = fromClient._id;
        transaction.toClient = toClient._id;
        transaction.fromCurrency = fromCurrency._id;
        transaction.toCurrency = toCurrency._id;
        transaction.deptedForUs = deptedForUsNum;
        transaction.creditForUs = creditForUsNum;
        transaction.ResultInDollars = shortResultInDollars;
        transaction.description = description;
        transaction.type = type;
        // Optionally update date or keep original
        transaction.date = Date.now();
        transaction.fromClientName = fromClientName;
        transaction.toClientName = toClientName;
        transaction.fromNameCurrency = fromCurrencyNameInArabic;
        transaction.toNameCurrency = toCurrencyNameInArabic;
        transaction.user = user._id;
        transaction.userName = userName;

        await transaction.save();

        // Update client and currency balances with new values
        fromClient.totalDebt = toShortNumber(fromClient.totalDebt + (creditForUsNum * fromCurrency.exchRate), 2);
        toClient.totalCredit = toShortNumber(toClient.totalCredit + (deptedForUsNum * toCurrency.exchRate), 2);
        fromCurrency.credit = toShortNumber(fromCurrency.credit + deptedForUsNum, 2);
        toCurrency.credit = toShortNumber(toCurrency.credit - creditForUsNum, 2);

        await fromClient.save();
        await toClient.save();
        await fromCurrency.save();
        await toCurrency.save();

        await createNotification(user._id, `Transaction ${transactionNumber} updated by ${userName}.`);


        res.status(200).send(transaction);
    } catch (error) {
        res.status(400).send(error);
    }
};

//delete
export const deleteTransactionById = async (req, res) => {
    try {
        const id = req.params.id;
        const transaction = await Transaction.findById(id);
        
        if (!transaction) {
            return res.status(404).send({ error: 'Transaction not found' });
        }

        // Fetch client and currency details related to the transaction
        const fromClient = await Client.findById(transaction.fromClient);
        const toClient = await Client.findById(transaction.toClient);
        const fromCurrency = await Currency.findById(transaction.fromCurrency);
        const toCurrency = await Currency.findById(transaction.toCurrency);

        // Revert balances for clients and currencies
        fromClient.totalDebt = toShortNumber(fromClient.totalDebt - (transaction.creditForUs * fromCurrency.exchRate), 2);
        toClient.totalCredit = toShortNumber(toClient.totalCredit - (transaction.deptedForUs * toCurrency.exchRate), 2);
        fromCurrency.credit = toShortNumber(fromCurrency.credit - transaction.deptedForUs, 2);
        toCurrency.credit = toShortNumber(toCurrency.credit + transaction.creditForUs, 2);

        await fromClient.save();
        await toClient.save();
        await fromCurrency.save();
        await toCurrency.save();

        // Delete the transaction
        await Transaction.findByIdAndDelete(id);

        await createNotification(user._id, `Transaction ${transaction.transactionNumber} deleted.`);


        res.status(200).send({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(400).send(error);
    }
};

//getbyID
export const getTransactionById = async (req, res) => {
    try {
        const id = req.params.id;
        const transaction = await Transaction.findById(id)
            .populate('fromClient', 'name')
            .populate('toClient', 'name')
            .populate('fromCurrency', 'nameInArabic')
            .populate('toCurrency', 'nameInArabic')
            .populate('user', 'username');

        if (!transaction) {
            return res.status(404).send({ error: 'Transaction not found' });
        }

        res.status(200).send(transaction);
    } catch (error) {
        res.status(400).send(error);
    }
};

//getall
export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({})
            .populate('fromClient', 'name')
            .populate('toClient', 'name')
            .populate('fromCurrency', 'nameInArabic')
            .populate('toCurrency', 'nameInArabic')
            .populate('user', 'username');

        if (transactions.length === 0) {
            return res.status(404).send({ message: 'No transactions found' });
        }

        res.status(200).send(transactions);
    } catch (error) {
        res.status(400).send(error);
    }
};

//getbyclient
export const getTransactionsByClient = async (req, res) => {
    try {
        const clientName = req.params.clientName;
        const transactions = await Transaction.find({
            $or: [
                { fromClientName: clientName },
                { toClientName: clientName }
            ]
        })
            .populate('fromClient', 'name')
            .populate('toClient', 'name')
            .populate('fromCurrency', 'nameInArabic')
            .populate('toCurrency', 'nameInArabic')
            .populate('user', 'username');

        if (transactions.length === 0) {
            return res.status(404).send({ error: 'No transactions found for this client' });
        }

        res.status(200).send(transactions);
    } catch (error) {
        res.status(400).send(error);
    }
};

//getbycurrency
export const getTransactionsByCurrency = async (req, res) => {
    try {
        const currencyNameInArabic = req.params.currencyNameInArabic;
        const transactions = await Transaction.find({
            $or: [
                { fromNameCurrency: currencyNameInArabic },
                { toNameCurrency: currencyNameInArabic }
            ]
        })
            .populate('fromClient', 'name')
            .populate('toClient', 'name')
            .populate('fromCurrency', 'nameInArabic')
            .populate('toCurrency', 'nameInArabic')
            .populate('user', 'username');

        if (transactions.length === 0) {
            return res.status(404).send({ error: 'No transactions found for this currency' });
        }

        res.status(200).send(transactions);
    } catch (error) {
        res.status(400).send(error);
    }
};


export const getTransactionsByClientGroupedByCurrency = async (req, res) => {
    try {
        const clientName = req.params.clientName;

        const transactions = await Transaction.aggregate([
            {
                $match: {
                    $or: [
                        { fromClientName: clientName },
                        { toClientName: clientName }
                    ]
                }
            },
            {
                $facet: {
                    fromClientTransactions: [
                        { $match: { fromClientName: clientName } },
                        {
                            $group: {
                                _id: "$fromNameCurrency",
                                totalCreditForUs: { $sum: "$creditForUs" },
                                transactionIds: { $push: "$_id" }
                            }
                        }
                    ],
                    toClientTransactions: [
                        { $match: { toClientName: clientName } },
                        {
                            $group: {
                                _id: "$toNameCurrency",
                                totalDeptedForUs: { $sum: "$deptedForUs" },
                                transactionIds: { $push: "$_id" }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    merged: {
                        $setUnion: [
                            {
                                $map: {
                                    input: "$fromClientTransactions",
                                    as: "from",
                                    in: {
                                        currencyName: "$$from._id",
                                        totalCreditForUs: "$$from.totalCreditForUs",
                                        totalDeptedForUs: { $literal: 0 },
                                        transactionIds: "$$from.transactionIds"
                                    }
                                }
                            },
                            {
                                $map: {
                                    input: "$toClientTransactions",
                                    as: "to",
                                    in: {
                                        currencyName: "$$to._id",
                                        totalCreditForUs: { $literal: 0 },
                                        totalDeptedForUs: "$$to.totalDeptedForUs",
                                        transactionIds: "$$to.transactionIds"
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            {
                $unwind: "$merged"
            },
            {
                $group: {
                    _id: "$merged.currencyName",
                    totalCreditForUs: { $sum: "$merged.totalCreditForUs" },
                    totalDeptedForUs: { $sum: "$merged.totalDeptedForUs" },
                    transactionIds: { $push: "$merged.transactionIds" }
                }
            },
            {
                $project: {
                    _id: 0,
                    currencyName: "$_id",
                    totalCreditForUs: 1,
                    totalDeptedForUs: 1,
                    transactionIds: { 
                        $reduce: {
                            input: "$transactionIds",
                            initialValue: [],
                            in: { $concatArrays: ["$$value", "$$this"] }
                        }
                    }
                }
            }
        ]);

        res.status(200).send(transactions);
    } catch (error) {
        res.status(500).send(error);
    }
};


export const getTransactionsByCurrencyGroupedByClient = async (req, res) => {
    try {
        const currencyName = req.params.currencyName;

        const transactions = await Transaction.aggregate([
            {
                $match: {
                    $or: [
                        { fromNameCurrency: currencyName },
                        { toNameCurrency: currencyName }
                    ]
                }
            },
            {
                $facet: {
                    fromCurrencyTransactions: [
                        { $match: { fromNameCurrency: currencyName } },
                        {
                            $group: {
                                _id: "$fromClientName",
                                totalCreditForUs: { $sum: "$creditForUs" },
                                transactionIds: { $push: "$_id" }
                            }
                        }
                    ],
                    toCurrencyTransactions: [
                        { $match: { toNameCurrency: currencyName } },
                        {
                            $group: {
                                _id: "$toClientName",
                                totalDeptedForUs: { $sum: "$deptedForUs" },
                                transactionIds: { $push: "$_id" }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    merged: {
                        $setUnion: [
                            {
                                $map: {
                                    input: "$fromCurrencyTransactions",
                                    as: "from",
                                    in: {
                                        clientName: "$$from._id",
                                        totalCreditForUs: "$$from.totalCreditForUs",
                                        totalDeptedForUs: { $literal: 0 },
                                        transactionIds: "$$from.transactionIds"
                                    }
                                }
                            },
                            {
                                $map: {
                                    input: "$toCurrencyTransactions",
                                    as: "to",
                                    in: {
                                        clientName: "$$to._id",
                                        totalCreditForUs: { $literal: 0 },
                                        totalDeptedForUs: "$$to.totalDeptedForUs",
                                        transactionIds: "$$to.transactionIds"
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            {
                $unwind: "$merged"
            },
            {
                $group: {
                    _id: "$merged.clientName",
                    totalCreditForUs: { $sum: "$merged.totalCreditForUs" },
                    totalDeptedForUs: { $sum: "$merged.totalDeptedForUs" },
                    transactionIds: { $push: "$merged.transactionIds" }
                }
            },
            {
                $project: {
                    _id: 0,
                    clientName: "$_id",
                    totalCreditForUs: 1,
                    totalDeptedForUs: 1,
                    transactionIds: {
                        $reduce: {
                            input: "$transactionIds",
                            initialValue: [],
                            in: { $concatArrays: ["$$value", "$$this"] }
                        }
                    }
                }
            }
        ]);

        res.status(200).send(transactions);
    } catch (error) {
        res.status(500).send(error);
    }
};

//functions
const getClientIdsByNames = async (names) => {
    const clients = await Client.find({ name: { $in: names } });
    return clients.map(client => client._id);
};
const getCurrencyIdsByNames = async (names) => {
    const currencies = await Currency.find({ nameInArabic: { $in: names } });
    return currencies.map(currency => currency._id);
};

// Get transactions based on client names and currency names
export const getTransactionsByNames = async (req, res) => {
    const { clientNames, currencyNames } = req.body;

    try {
        // Get client and currency IDs
        const clientIds = await getClientIdsByNames(clientNames);
        const currencyIds = await getCurrencyIdsByNames(currencyNames);

        // Query transactions
        const transactions = await Transaction.find({
            $or: [
                { fromClient: { $in: clientIds }, fromCurrency: { $in: currencyIds } },
                { toClient: { $in: clientIds }, toCurrency: { $in: currencyIds } }
            ]
        }).populate([
            { path: 'fromClient', select: 'name' },
            { path: 'toClient', select: 'name' },
            { path: 'fromCurrency', select: 'nameInArabic' },
            { path: 'toCurrency', select: 'nameInArabic' }
        ]);

        res.status(200).send(transactions);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Get transactions based on client names, currency names, and date range
export const getTransactionsByNamesAndDate = async (req, res) => {
    const { clientNames, currencyNames, startDate, endDate } = req.body;

    try {
        // Get client and currency IDs
        const clientIds = await getClientIdsByNames(clientNames);
        const currencyIds = await getCurrencyIdsByNames(currencyNames);

        // Convert dates to ISO format
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Query transactions
        const transactions = await Transaction.find({
            $or: [
                { fromClient: { $in: clientIds }, fromCurrency: { $in: currencyIds } },
                { toClient: { $in: clientIds }, toCurrency: { $in: currencyIds } }
            ],
            date: { $gte: start, $lte: end }
        }).populate([
            { path: 'fromClient', select: 'name' },
            { path: 'toClient', select: 'name' },
            { path: 'fromCurrency', select: 'nameInArabic' },
            { path: 'toCurrency', select: 'nameInArabic' }
        ]);

        res.status(200).send(transactions);
    } catch (error) {
        res.status(500).send(error);
    }
};



//archive
export const archiveTransaction = async (req, res) => {
    try {
        const id  = req.params.id;
        const transaction = await Transaction.findByIdAndUpdate(id, { archived: true }, { new: true });

        if (!transaction) {
            return res.status(404).send({ error: 'Transaction not found' });
        }

        await createNotification(transaction.user, `Transaction ${transaction.transactionNumber} archived.`);

        res.status(200).send(transaction);
    } catch (error) {
        res.status(500).send(error);
    }
};

//unarchive
export const unarchiveTransaction = async (req, res) => {
    try {
        const id  = req.params.id;
        const transaction = await Transaction.findByIdAndUpdate(id, { archived: false }, { new: true });

        if (!transaction) {
            return res.status(404).send({ error: 'Transaction not found' });
        }

        await createNotification(transaction.user, `Transaction ${transaction.transactionNumber} unarchived.`);

        res.status(200).send(transaction);
    } catch (error) {
        res.status(500).send(error);
    }
};
