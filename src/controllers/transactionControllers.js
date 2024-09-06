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
        
        const { fromClientName, toClientName, fromCurrencyNameInArabic, toCurrencyNameInArabic, deptedForUsNum , creditForUsNum, description, type, userName } = req.body;

        console.log(req.body);

        const fromClient = await Client.findOne({ name: fromClientName });
        const toClient = await Client.findOne({ name: toClientName });


        const fromCurrency = await Currency.findOne({ nameInArabic: fromCurrencyNameInArabic });
        const toCurrency = await Currency.findOne({ nameInArabic: toCurrencyNameInArabic });


        const user = await User.findOne({ username: userName });


        const resultInDollars = (+creditForUsNum * fromCurrency.exchRate) - (+deptedForUsNum * toCurrency.exchRate);


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
            date: new Date().toLocaleString("en-US", {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }),
            fromClientName:fromClientName,
            toClientName:toClientName,
            fromNameCurrency:fromCurrencyNameInArabic,
            toNameCurrency:toCurrencyNameInArabic,
            user: user._id,
            userName:userName,
            transactionNumber: transactionNumber,
        });



        await transaction.save();

        fromClient.totalDebt = toShortNumber(fromClient.totalDebt + (+creditForUsNum * fromCurrency.exchRate), 2);
        toClient.totalCredit = toShortNumber(toClient.totalCredit + (+deptedForUsNum * toCurrency.exchRate), 2);
        fromCurrency.credit = toShortNumber(fromCurrency.credit + +creditForUsNum, 2);
        toCurrency.credit = toShortNumber(toCurrency.credit - +deptedForUsNum, 2);

        await fromClient.save();
        await toClient.save();
        await fromCurrency.save();
        await toCurrency.save();

        
        //!add default client logic
        const shortResultInDollarsForDefaultClient = toShortNumber(resultInDollars, 2);
        const defaultClient = await Client.findOne({ name: "ارباح و الخسائر" });
        if (shortResultInDollarsForDefaultClient < 0) {
            defaultClient.totalDebt += shortResultInDollarsForDefaultClient;
        } else {
            defaultClient.totalCredit += shortResultInDollarsForDefaultClient;
        }
        await defaultClient.save();

        const defaultClient1 = await Client.findOne({ name: "ارباح و الخسائر يومية" });
        if (shortResultInDollarsForDefaultClient < 0) {
            defaultClient1.totalDebt += shortResultInDollarsForDefaultClient;
        } else {
            defaultClient1.totalCredit += shortResultInDollarsForDefaultClient;
        }
        await defaultClient1.save();

        res.json(transaction);
    } catch (error) {
        console.log(error);
        res.status(400);
    }
};










// update
export const updateTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const updates = req.body;

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).send('Transaction not found');

        const { fromClientName, toClientName, fromCurrencyNameInArabic, toCurrencyNameInArabic, deptedForUsNum, creditForUsNum, description, type, userName } = updates;

        const fromClient = await Client.findOne({ name: fromClientName });
        const toClient = await Client.findOne({ name: toClientName });
        const fromCurrency = await Currency.findOne({ nameInArabic: fromCurrencyNameInArabic });
        const toCurrency = await Currency.findOne({ nameInArabic: toCurrencyNameInArabic });
        const user = await User.findOne({ username: userName });

        // Calculate new result
        const resultInDollars = (creditForUsNum * fromCurrency.exchRate) - (deptedForUsNum * toCurrency.exchRate);
        const shortResultInDollars = toShortNumber(resultInDollars, 2);

        // Update transaction fields
        transaction.fromClient = fromClient._id;
        transaction.toClient = toClient._id;
        transaction.fromCurrency = fromCurrency._id;
        transaction.toCurrency = toCurrency._id;
        transaction.deptedForUs = deptedForUsNum;
        transaction.creditForUs = creditForUsNum;
        transaction.ResultInDollars = shortResultInDollars;
        transaction.description = description;
        transaction.type = type;
        transaction.date = Date.now();
        transaction.fromClientName = fromClientName;
        transaction.toClientName = toClientName;
        transaction.fromNameCurrency = fromCurrencyNameInArabic;
        transaction.toNameCurrency = toCurrencyNameInArabic;
        transaction.user = user._id;
        transaction.userName = userName;

        await transaction.save();

        // Revert old balances
        const oldFromClient = await Client.findById(transaction.fromClient);
        const oldToClient = await Client.findById(transaction.toClient);
        const oldFromCurrency = await Currency.findById(transaction.fromCurrency);
        const oldToCurrency = await Currency.findById(transaction.toCurrency);

        oldFromClient.totalDebt -= (transaction.creditForUs * oldFromCurrency.exchRate);
        oldToClient.totalCredit -= (transaction.deptedForUs * oldToCurrency.exchRate);
        oldFromCurrency.credit -= transaction.creditForUs;
        oldToCurrency.credit += transaction.deptedForUs;

        await oldFromClient.save();
        await oldToClient.save();
        await oldFromCurrency.save();
        await oldToCurrency.save();

        // Update new balances
        fromClient.totalDebt += (creditForUsNum * fromCurrency.exchRate);
        toClient.totalCredit += (deptedForUsNum * toCurrency.exchRate);
        fromCurrency.credit += creditForUsNum;
        toCurrency.credit -= deptedForUsNum;

        await fromClient.save();
        await toClient.save();
        await fromCurrency.save();
        await toCurrency.save();

        //! Update defaultClient based on resultInDollars
        const defaultClient = await Client.findOne({ name: "ارباح و الخسائر" });
        const oldResultInDollars = transaction.ResultInDollars;
        if (oldResultInDollars < 0) {
            defaultClient.totalDebt -= oldResultInDollars;
        } else {
            defaultClient.totalCredit -= oldResultInDollars;
        }
        if (resultInDollars < 0) {
            defaultClient.totalDebt += resultInDollars;
        } else {
            defaultClient.totalCredit += resultInDollars;
        }
        await defaultClient.save();

        res.status(200).send(transaction);
    } catch (error) {
        res.status(400).send(error);
    }
};

//delete
export const deleteTransactionById = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).send('Transaction not found');

        const { fromClient, toClient, fromCurrency, toCurrency, ResultInDollars, creditForUs, deptedForUs } = transaction;

        await transaction.remove();

        const fromClientDoc = await Client.findById(fromClient);
        const toClientDoc = await Client.findById(toClient);
        const fromCurrencyDoc = await Currency.findById(fromCurrency);
        const toCurrencyDoc = await Currency.findById(toCurrency);

        fromClientDoc.totalDebt -= (creditForUs * fromCurrencyDoc.exchRate);
        toClientDoc.totalCredit -= (deptedForUs * toCurrencyDoc.exchRate);
        fromCurrencyDoc.credit -= creditForUs;
        toCurrencyDoc.credit += deptedForUs;

        await fromClientDoc.save();
        await toClientDoc.save();
        await fromCurrencyDoc.save();
        await toCurrencyDoc.save();

        //! Update defaultClient based on ResultInDollars
        const defaultClient = await Client.findOne({ name: "ارباح و الخسائر" });
        if (ResultInDollars < 0) {
            defaultClient.totalDebt -= ResultInDollars;
        } else {
            defaultClient.totalCredit -= ResultInDollars;
        }
        await defaultClient.save();

        res.status(200).send('Transaction deleted successfully');
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



        res.status(200).json(transactions);

    } catch (error) {
        console.log(error)
        res.send(error.message)
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



export const getTransactionsByNames = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const ids = req.body.ids;
            const account = {
                clientName: req.body.clientName,
                currencyName: req.body.currencyName
            }


           if (!Array.isArray(ids) || ids.length === 0) {
            console.log('Invalid input:', ids);
            return res.status(400).send({ error: "Invalid input: IDs should be a non-empty array." });
        }

        // Fetch transactions by the provided IDs
        const transactions = await Transaction.find({ _id: { $in: ids } });

        // Check if transactions were found
        if (!transactions || transactions.length === 0) {
            return res.status(404).send({ error: "No transactions found for the provided IDs." });
        }

        let totalCreditForUs = 0;
        let totalDeptedForUs = 0;

            transactions.forEach(transaction => {
                if (transaction.creditForUs != NaN && transaction.deptedForUs != NaN) {
                    totalCreditForUs += +transaction.creditForUs;
                    totalDeptedForUs += +transaction.deptedForUs;
                }
            })

            const total = {
                totalCreditForUs: +totalCreditForUs.toFixed(4),
                totalDeptedForUs: +totalDeptedForUs.toFixed(4),
                totalCredit: (+totalCreditForUs - +totalDeptedForUs)
            }

        res.render('financial-management/account-statment.ejs', {transactions: transactions, account: account, total: total});


        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).send({ error: "An error occurred while fetching transactions." });
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











export const getGeneralBudget = async (req, res) => {
    try {
        if (req.isAuthenticated()) {

            const clients = await Client.find();


            const result = clients.map(client => {
                let balance = client.totalDebt - client.totalCredit;
                let newBalance = 0;
                if ( balance < 0) {
                    newBalance = balance;
                    balance = 0;
                }

                return {
                    _id: client._id,
                    name: client.name,
                    totalDebt: client.totalDebt,
                    totalCredit: client.totalCredit,
                    balanceDebt: +balance.toFixed(3),
                    balanceCredit: +newBalance.toFixed(3),
                }
            })

            let total = {
                DebtOnUs: 0,
                CreditOnUs: 0,
                balanceDebt: 0,
                balanceCredit: 0,
                diff: 0,
            };
            
            result.forEach(client => {
                total.DebtOnUs += +client.totalDebt.toFixed(3);
                total.CreditOnUs += +client.totalCredit.toFixed(3);
                total.balanceDebt += +client.balanceDebt;
                total.balanceCredit += +client.balanceCredit;
            });
            

            total.balanceDebt = +total.balanceDebt.toFixed(3);
            total.balanceCredit = +total.balanceCredit.toFixed(3);

            total.diff =  +total.balanceDebt.toFixed(2) - +total.balanceCredit.toFixed(2);

            res.render('financial-management/general-budget.ejs', {clients: result, total: total});
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        res.send("error")
    }
}


export const getFinances = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            
            const result = await Currency.find().sort({priorityCu: 1});
            const dailyEarnings = await Client.find({name: "ارباح و الخسائر يومية"});
            

            const currencies = result.map(currency => {
                return {
                    _id: currency._id,
                    nameInArabic: currency.nameInArabic,
                    nameInenglish: currency.nameInEnglish,
                    code: currency.code,
                    symbol: currency.symbol,
                    priorityCu: currency.priorityCu,
                    exchRate: currency.exchRate,
                    credit: currency.credit.toFixed(2),
                    creditInDoll: (currency.credit * currency.exchRate).toFixed(2)
                }
            });

            let totalInDoll = 0;

            currencies.forEach(currency => {
                if (currency.creditInDoll != NaN) {
                    totalInDoll += +currency.creditInDoll
                }
            })

            const total = {
                totalInDoll: +totalInDoll.toFixed(4),
                totalEarnings: +(dailyEarnings[0].totalDebt - dailyEarnings[0].totalCredit).toFixed(2)
            }

            

            res.render('financial-management.ejs', {currencies: currencies, total: total});


        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error)
        res.send("Error")
    }
}


export const getReconciliation = async (req, res) => {
    try {
        if (req.isAuthenticated()) {

            const clients = await Client.find().sort({priorityCli: 1})
            const currencies = await Currency.find().sort({priorityCu: 1})

            console.log(req.session.passport);

            res.render('financial-management/reconciliation.ejs', {currencies: currencies, clients: clients, userName: req.session.passport.user.userName});
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error)
        res.send("error")
    }
}



export const getJournal = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const result = await Transaction.find({})
            .populate('fromClient', 'name')
            .populate('toClient', 'name')
            .populate('fromCurrency', 'nameInArabic')
            .populate('toCurrency', 'nameInArabic')
            .populate('user', 'username');

            res.render('financial-management/journal.ejs', {transactions: result});
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        res.send("error")
    }
}



export const getLedger = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const clients = await Client.find().sort({priorityCli: 1});
            res.render('financial-management/ledger.ejs', {clients: clients});
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        res.send("error")
    }
}


export const getLedgerAccount = async (req, res) => {
    try {

        if (req.isAuthenticated()) {

            res.render('financial-management/account-statment.ejs');


        } else {
            res.redirect('/login')
        }

    } catch(error) {
        console.log(error)
        res.send(error.message)
    }
}