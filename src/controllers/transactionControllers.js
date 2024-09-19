import mongoose from 'mongoose';
import Client from '../models/client.js';
import Currency from '../models/currency.js';
import Transaction from '../models/transaction.js';
import User from '../models/user.js';
import {createNotification} from './notificationsControllers.js';


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
        
        const { fromClientName, toClientName, fromCurrencyNameInArabic, toCurrencyNameInArabic, deptedForUsNum , creditForUsNum, description, type } = req.body;


        const fromClient = await Client.findOne({ name: fromClientName });
        const toClient = await Client.findOne({ name: toClientName });


        const fromCurrency = await Currency.findOne({ nameInArabic: fromCurrencyNameInArabic });
        const toCurrency = await Currency.findOne({ nameInArabic: toCurrencyNameInArabic });

        const userName = req.session.passport.user.userName;
        // const user = await User.findOne({ username: userName });
        const user = req.session.passport.user.userId;


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
            user: user,
            userName: userName,
            transactionNumber: transactionNumber,
        });



        await transaction.save();
/* 
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
        const defaultClient1 = await Client.findOne({ name: "ارباح و الخسائر يومية" });
        if (shortResultInDollarsForDefaultClient < 0) {
            defaultClient1.totalDebt += shortResultInDollarsForDefaultClient;
        } else {
            defaultClient1.totalCredit += shortResultInDollarsForDefaultClient;
        }
        if (fromClientName === "ارباح و الخسائر"){
            defaultClient1.totalDebt = toShortNumber(defaultClient1.totalDebt + (creditForUsNum * fromCurrency.exchRate), 2);
            }
        if (toClientName === "ارباح و الخسائر") {
            defaultClient1.totalCredit = toShortNumber(defaultClient1.totalCredit + (deptedForUsNum * toCurrency.exchRate), 2);
        }
        await defaultClient1.save(); */

        addLogic(transaction);

        res.json(transaction);
    } catch (error) {
        console.log(error);
        res.status(400);
    }
};


//helper functions
const deleteLogic = async (transaction) => {
    // Update logic for client and currency balances
    const { fromClient, toClient, fromCurrency, toCurrency, deptedForUs, creditForUs, ResultInDollars } = transaction;


    const fromClientDoc = await Client.findById(fromClient);
    const toClientDoc = await Client.findById(toClient);
    const fromCurrencyDoc = await Currency.findById(fromCurrency);
    const toCurrencyDoc = await Currency.findById(toCurrency);

    if (fromClientDoc && fromCurrencyDoc) {
        fromClientDoc.totalDebt -= (creditForUs * fromCurrencyDoc.exchRate);
        fromCurrencyDoc.credit -= creditForUs;
        await fromClientDoc.save();
        await fromCurrencyDoc.save();
    }

    if (toClientDoc && toCurrencyDoc) {
        toClientDoc.totalCredit -= (deptedForUs * toCurrencyDoc.exchRate);
        toCurrencyDoc.credit += deptedForUs;
        await toClientDoc.save();
        await toCurrencyDoc.save();
    }

    const defaultClient = await Client.findOne({ name: "ارباح و الخسائر" });
    if (defaultClient) {
        if (ResultInDollars < 0) {
            defaultClient.totalDebt -= ResultInDollars;
        } else {
            defaultClient.totalCredit -= ResultInDollars;
        }
        await defaultClient.save();
    }

    if (transaction.date === date.today()){
    const defaultClient1 = await Client.findOne({ name: "ارباح و الخسائر يومية" });
    if (defaultClient1) {
        if (ResultInDollars < 0) {
            defaultClient1.totalDebt -= ResultInDollars;
        } else {
            defaultClient1.totalCredit -= ResultInDollars;
        }
        if (fromClientName= "ارباح و الخسائر"){
            defaultClient1.totalDebt = toShortNumber(defaultClient1.totalDebt - (creditForUs * fromCurrencyDoc.exchRate), 2);
            }
        if (toClientName = "ارباح و الخسائر") {
            defaultClient1.totalCredit = toShortNumber(defaultClient1.totalCredit - (deptedForUs * toCurrencyDoc.exchRate), 2);
        }
        await defaultClient1.save();
    }}

    if (type === "إلغاء" && CancelID) {
        const originalTransaction = await Transaction.findById(CancelID);
        if (originalTransaction) {
            originalTransaction.isCanceled = false;
            await originalTransaction.save();
        }
    }

};


const addLogic = async (transaction) => {

    const {
        fromClient,
        toClient,
        fromClientName,
        toClientName,
        fromCurrency,
        toCurrency,
        deptedForUs,
        creditForUs,
        ResultInDollars,
    } = transaction;


    const fromClientDoc = await Client.findById(fromClient);
    const toClientDoc = await Client.findById(toClient);
    const fromCurrencyDoc = await Currency.findById(fromCurrency);
    const toCurrencyDoc = await Currency.findById(toCurrency);


    fromClientDoc.totalDebt += creditForUs * fromCurrencyDoc.exchRate;
    toClientDoc.totalCredit += deptedForUs * toCurrencyDoc.exchRate;
    fromCurrencyDoc.credit += creditForUs;
    toCurrencyDoc.credit -= deptedForUs;

    await fromClientDoc.save();
    await toClientDoc.save();
    await fromCurrencyDoc.save();
    await toCurrencyDoc.save();


    const resultInDollars = (Number(creditForUs) * fromCurrencyDoc.exchRate) - (Number(deptedForUs) * toCurrencyDoc.exchRate);
    const shortResultInDollarsForDefaultClient = toShortNumber(resultInDollars, 2);

    if (transaction.toClientName !== "حسابات متعددة") {
    const defaultClient = await Client.findOne({ name: "ارباح و الخسائر" });
    if (shortResultInDollarsForDefaultClient > 0) {
        defaultClient.totalCredit += shortResultInDollarsForDefaultClient;
    } else {
        defaultClient.totalDebt += Math.abs(shortResultInDollarsForDefaultClient);
    }
    await defaultClient.save();


    const defaultClient1 = await Client.findOne({ name: "ارباح و الخسائر يومية" });


    if (shortResultInDollarsForDefaultClient > 0) {
        defaultClient1.totalCredit += shortResultInDollarsForDefaultClient;
    } else {
        defaultClient1.totalDebt += Math.abs(shortResultInDollarsForDefaultClient);
    }


    if (fromClientName === "ارباح و الخسائر") {
        defaultClient1.totalDebt = toShortNumber(defaultClient1.totalDebt + (creditForUs * fromCurrencyDoc.exchRate), 2);
    }
    if (toClientName === "ارباح و الخسائر") {
        defaultClient1.totalCredit = toShortNumber(defaultClient1.totalCredit + (deptedForUs * toCurrencyDoc.exchRate), 2);
    }

    await defaultClient1.save();
    }
};

const exchangeToDollar = async(currencyname,rate)=>{
    const CurrencyDoc = await Currency.findOne({nameInArabic: currencyname});
    return(rate * CurrencyDoc.exchRate);
}


export const createMultipleTransactions = async (req, res) => {
    const transactionsData = req.body.transactions;

    if (!Array.isArray(transactionsData) || transactionsData.length === 0) {
        return res.status(400).send({ error: "Invalid input: transactions should be a non-empty array." });
    }

    try {
        const createdTransactions = [];
        const date = new Date().toLocaleString("en-US", {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        const number = await generateTransactionNumber();
        const description = transactionsData[0].description;
        let sumDept = 0;
        let sumCredit = 0;

        for (const transactionData of transactionsData) {
            let {
                fromClientName,
                toClientName,
                fromCurrencyName,
                toCurrencyName,
                deptedForUs,
                creditForUs,
                description,
                userName,
                type,
            } = transactionData;

            userName = req.session.passport.user.userName;
            console.log('fromClientName:', fromClientName);
            console.log('toClientName:', toClientName);
            console.log('fromCurrencyName:', fromCurrencyName);
            console.log('toCurrencyName:', toCurrencyName);


            const fromClient = await Client.findOne({ name: fromClientName });
            const toClient = await Client.findOne({ name: toClientName });
            const fromCurrency = await Currency.findOne({ nameInArabic: fromCurrencyName });
            const toCurrency = await Currency.findOne({ nameInArabic: toCurrencyName });
            const user = req.session.passport.user.userId;

            if (!fromClient || !toClient || !fromCurrency || !toCurrency || !user) {
                // Logging to debug
                console.error("From Client:", fromClient);
                console.error("To Client:", toClient);
                console.error("From Currency:", fromCurrency);
                console.error("To Currency:", toCurrency);
                console.error("User:", user);

                return res.status(400).send({ error: "Client, Currency or User not found." });
            }

            const resultInDollars = creditForUs - deptedForUs;

            const transaction = new Transaction({
                fromClient,
                toClient,
                fromCurrency,
                toCurrency,
                deptedForUs,
                creditForUs,
                ResultInDollars: resultInDollars,
                description,
                user,
                userName,
                type,
                transactionNumber: number,
                date: date,
                fromClientName: fromClientName,
                toClientName: toClientName,
                fromNameCurrency: fromCurrencyName,
                toNameCurrency: toCurrencyName,
            });

            const savedTransaction = await transaction.save();
            createdTransactions.push(savedTransaction);

            await addLogic(transaction);

            sumDept += await exchangeToDollar(toCurrencyName, deptedForUs);
            sumCredit += await exchangeToDollar(fromCurrencyName, creditForUs);
        }

        const defaultClientName2 = await Client.findOne({ name: "حسابات متعددة" });
        const defaultCurrencyName2 = await Currency.findOne({ nameInArabic: "دولار أمريكي" });

        if (!defaultClientName2 || !defaultCurrencyName2) {
            return res.status(400).send({ error: "Default client or currency not found." });
        }

        const motherTransaction = new Transaction({
            fromClient: defaultClientName2,
            toClient: defaultClientName2,
            fromCurrency: defaultCurrencyName2,
            toCurrency: defaultCurrencyName2,
            deptedForUs: toShortNumber(sumDept, 2),
            creditForUs: toShortNumber(sumCredit, 2),
            ResultInDollars: sumCredit - sumDept,
            description,
            user: req.session.passport.user.userId,
            userName: req.session.passport.user.userName,
            transactionNumber: number,
            date: date,
            fromClientName: "حسابات متعددة",
            toClientName: "حسابات متعددة",
            fromNameCurrency: "الدولار الأمريكي",
            toNameCurrency: "الدولار الأمريكي",
            type: "متعددة",
        });

        const savedMotherTransaction = await motherTransaction.save();
        createdTransactions.push(savedMotherTransaction);

        res.status(201).send(createdTransactions);
    } catch (error) {
        console.error("Error creating transactions:", error);
        res.status(500).send(error.message);
    }
};



//     try {
        
//         const transactionId = req.params.id;
//         const updates = req.body;

//         const transaction = await Transaction.findById(transactionId);
//         if (!transaction) return res.status(404).send('Transaction not found');

//         const { fromClientName, toClientName, fromCurrencyNameInArabic, toCurrencyNameInArabic, deptedForUsNum, creditForUsNum, description, type, userName } = updates;

//         const fromClient = await Client.findOne({ name: fromClientName });
//         const toClient = await Client.findOne({ name: toClientName });
//         const fromCurrency = await Currency.findOne({ nameInArabic: fromCurrencyNameInArabic });
//         const toCurrency = await Currency.findOne({ nameInArabic: toCurrencyNameInArabic });
//         const user = await User.findOne({ username: userName });

//         // Calculate new result
//         const resultInDollars = (creditForUsNum * fromCurrency.exchRate) - (deptedForUsNum * toCurrency.exchRate);
//         const shortResultInDollars = toShortNumber(resultInDollars, 2);

//         // Update transaction fields
//         transaction.fromClient = fromClient._id;
//         transaction.toClient = toClient._id;
//         transaction.fromCurrency = fromCurrency._id;
//         transaction.toCurrency = toCurrency._id;
//         transaction.deptedForUs = deptedForUsNum;
//         transaction.creditForUs = creditForUsNum;
//         transaction.ResultInDollars = shortResultInDollars;
//         transaction.description = description;
//         transaction.type = type;
//         transaction.fromClientName = fromClientName;
//         transaction.toClientName = toClientName;
//         transaction.fromNameCurrency = fromCurrencyNameInArabic;
//         transaction.toNameCurrency = toCurrencyNameInArabic;
//         transaction.user = user._id;
//         transaction.userName = userName;

//         await transaction.save();

//         // Revert old balances
//         const oldFromClient = await Client.findById(transaction.fromClient);
//         const oldToClient = await Client.findById(transaction.toClient);
//         const oldFromCurrency = await Currency.findById(transaction.fromCurrency);
//         const oldToCurrency = await Currency.findById(transaction.toCurrency);

//         oldFromClient.totalDebt -= (transaction.creditForUs * oldFromCurrency.exchRate);
//         oldToClient.totalCredit -= (transaction.deptedForUs * oldToCurrency.exchRate);
//         oldFromCurrency.credit -= transaction.creditForUs;
//         oldToCurrency.credit += transaction.deptedForUs;

//         await oldFromClient.save();
//         await oldToClient.save();
//         await oldFromCurrency.save();
//         await oldToCurrency.save();

//         // Update new balances
//         fromClient.totalDebt += (creditForUsNum * fromCurrency.exchRate);
//         toClient.totalCredit += (deptedForUsNum * toCurrency.exchRate);
//         fromCurrency.credit += creditForUsNum;
//         toCurrency.credit -= deptedForUsNum;

//         await fromClient.save();
//         await toClient.save();
//         await fromCurrency.save();
//         await toCurrency.save();

//         // Update defaultClient based on resultInDollars
//         const defaultClient = await Client.findOne({ name: "ارباح و الخسائر" });
//         const oldResultInDollars = transaction.ResultInDollars;
//         if (oldResultInDollars < 0) {
//             defaultClient.totalDebt -= oldResultInDollars;
//         } else {
//             defaultClient.totalCredit -= oldResultInDollars;
//         }
//         if (resultInDollars < 0) {
//             defaultClient.totalDebt += resultInDollars;
//         } else {
//             defaultClient.totalCredit += resultInDollars;
//         }
//         await defaultClient.save();


//         if (transaction.date === date.today()){
//             const defaultClient1 = await Client.findOne({ name: "ارباح و الخسائر يومية" });
//             const oldResultInDollars = transaction.ResultInDollars;
//             if (oldResultInDollars < 0) {
//                 defaultClient1.totalDebt -= oldResultInDollars;
//             } else {
//                 defaultClient1.totalCredit -= oldResultInDollars;
//             }
//             if (resultInDollars < 0) {
//                 defaultClient1.totalDebt += resultInDollars;
//             } else {
//                 defaultClient1.totalCredit += resultInDollars;
//             }
//             if (fromClientName= "ارباح و الخسائر"){
//                 defaultClient1.totalDebt = toShortNumber(defaultClient1.totalDebt - (transaction.creditForUs * transaction.fromCurrency.exchRate), 2);
//                 defaultClient1.totalDebt = toShortNumber(defaultClient1.totalDebt + (creditForUsNum * fromCurrency.exchRate), 2);
//                 }
//             if (toClientName = "ارباح و الخسائر") {
//                 defaultClient1.totalCredit = toShortNumber(defaultClient1.totalCredit - (transaction.deptedForUs * transaction.toCurrency.exchRate), 2);
//                 defaultClient1.totalCredit = toShortNumber(defaultClient1.totalCredit + (deptedForUsNum * toCurrency.exchRate), 2);
//             }
//             await defaultClient1.save();
//     }


//     const username = req.session.passport.user.userName;
//     await createNotification(transaction.user,` Transaction ${transaction.transactionNumber} updated by ${username}`); //nzidou user hnaa


//         res.status(200).send(transaction);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// };


//cancel

export const updateTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const updates = req.body;

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).send('Transaction not found');

        const { fromClientName, toClientName, fromCurrencyNameInArabic, toCurrencyNameInArabic, deptedForUsNum, creditForUsNum, description, type, userName } = updates;

        userName = req.session.passport.user.userName;

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

        // Update defaultClient based on resultInDollars
        const defaultClient = await Client.findOne({ name: "ارباح و الخسائر" });
        const oldResultInDollars = transaction.ResultInDollars;
        if (oldResultInDollars < 0) {
            defaultClient.totalDebt -= Math.abs(oldResultInDollars);
        } else {
            defaultClient.totalCredit -= oldResultInDollars;
        }
        if (resultInDollars < 0) {
            defaultClient.totalDebt += Math.abs(resultInDollars);
        } else {
            defaultClient.totalCredit += resultInDollars;
        }
        await defaultClient.save();


        if (transaction.date === date.today()){
            const defaultClient1 = await Client.findOne({ name: "ارباح و الخسائر يومية" });
            const oldResultInDollars = transaction.ResultInDollars;
            if (oldResultInDollars < 0) {
                defaultClient1.totalDebt -= Math.abs(oldResultInDollars);
            } else {
                defaultClient1.totalCredit -= oldResultInDollars;
            }
            if (resultInDollars < 0) {
                defaultClient1.totalDebt += Math.abs(resultInDollars);
            } else {
                defaultClient1.totalCredit += resultInDollars;
            }
            if (fromClientName= "ارباح و الخسائر"){
                defaultClient1.totalDebt = toShortNumber(defaultClient1.totalDebt - (transaction.creditForUs * transaction.fromCurrency.exchRate), 2);
                defaultClient1.totalDebt = toShortNumber(defaultClient1.totalDebt + (creditForUsNum * fromCurrency.exchRate), 2);
            }
            if (toClientName = "ارباح و الخسائر") {
                defaultClient1.totalCredit = toShortNumber(defaultClient1.totalCredit - (transaction.deptedForUs * transaction.toCurrency.exchRate), 2);
                defaultClient1.totalCredit = toShortNumber(defaultClient1.totalCredit + (deptedForUsNum * toCurrency.exchRate), 2);
            }
            await defaultClient1.save();

    }


    const username = req.session.passport.user.userName;
    await createNotification(transaction.user,` Transaction ${transaction.transactionNumber} updated by ${username}`); //nzidou user hnaa


        res.status(200).send(transaction);
    } catch (error) {
        res.status(400).send(error);
    }
};


export const updateMultiTransaction = async (req, res) => {
    const motherTransactionId = req.params.transactionID;
    const newTransactionsData = req.body.newTransactions;

    if (!Array.isArray(newTransactionsData) || newTransactionsData.length === 0) {
        return res.status(400).send({ error: "Invalid input: newTransactions should be a non-empty array." });
    }

    try {
        // Step 1: Find the mother transaction by ID
        const motherTransaction = await Transaction.findById(motherTransactionId);
        if (!motherTransaction) {
            return res.status(404).send({ error: "Mother transaction not found." });
        }

        const transactionNumber = motherTransaction.transactionNumber;
        const originalDate = motherTransaction.date; // Keep the same date

        // Step 2: Find all transactions with the same transactionNumber (except the mother transaction)
        const linkedTransactions = await Transaction.find({
            transactionNumber,
            _id: { $ne: motherTransactionId }
        });

        let sumDeptedForUs = 0;
        let sumCreditForUs = 0;

        // Step 3: Revert client and currency balances for each transaction
        for (const linkedTransaction of linkedTransactions) {
            await revertTransaction(linkedTransaction); // Revert client and currency updates

            // Remove the transaction from the database
            await Transaction.findByIdAndDelete(linkedTransaction._id);
        }

        // Step 4: Create new transactions based on the provided newTransactions data
        const createdTransactions = [];
        for (const transactionData of newTransactionsData) {
            const {
                fromClientName,
                toClientName,
                fromCurrencyName,
                toCurrencyName,
                deptedForUs,
                creditForUs,
                description,
                type
            } = transactionData;

            // Find clients and currencies by name
            const fromClient = await Client.findOne({ name: fromClientName });
            const toClient = await Client.findOne({ name: toClientName });
            const fromCurrency = await Currency.findOne({ nameInArabic: fromCurrencyName });
            const toCurrency = await Currency.findOne({ nameInArabic: toCurrencyName });
            const user = req.session.passport.user.userId;
            const userName = req.session.passport.user.userName;

            if (!fromClient || !toClient || !fromCurrency || !toCurrency || !user) {
                return res.status(400).send({ error: "Client, Currency, or User not found." });
            }

            // Calculate ResultInDollars
            const resultInDollars = (creditForUs * fromCurrency.exchRate) - (deptedForUs * toCurrency.exchRate);

            // Create a new transaction
            const newTransaction = new Transaction({
                fromClient,
                toClient,
                fromCurrency,
                toCurrency,
                deptedForUs,
                creditForUs,
                ResultInDollars: toShortNumber(resultInDollars, 2),
                description,
                user,
                userName,
                type,
                transactionNumber,
                fromClientName,
                toClientName,
                fromNameCurrency: fromCurrencyName,
                toNameCurrency: toCurrencyName,
                date: originalDate // Use the original date from the mother transaction
            });

            const savedTransaction = await newTransaction.save();
            createdTransactions.push(savedTransaction);

            // Apply logic to update clients and currencies
            await addLogic(newTransaction);

            // Update the sums
            sumDeptedForUs += await exchangeToDollar(toCurrencyName, deptedForUs);
            sumCreditForUs += await exchangeToDollar(fromCurrencyName, creditForUs);
        }

        // Step 5: Update the mother transaction with new sums (no client or currency update)
        const updatedMotherTransaction = await Transaction.findByIdAndUpdate(
            motherTransactionId,
            {
                deptedForUs: toShortNumber(sumDeptedForUs, 2),
                creditForUs: toShortNumber(sumCreditForUs, 2),
                ResultInDollars: toShortNumber(sumCreditForUs - sumDeptedForUs, 2),
                description: newTransactionsData[0].description, // Use the first description
                type: "متعددة"
            },
            { new: true }
        );

        // Step 6: Update the default client (ارباح و الخسائر)
        const defaultClient = await Client.findOne({ name: "ارباح و الخسائر" });
        if (!defaultClient) {
            return res.status(400).send({ error: "Default client not found." });
        }

        // Update totalCredit or totalDebt based on the result
        if (updatedMotherTransaction.ResultInDollars > 0) {
            defaultClient.totalCredit += updatedMotherTransaction.ResultInDollars;
        } else {
            defaultClient.totalDebt += Math.abs(updatedMotherTransaction.ResultInDollars);
        }

        await defaultClient.save();

        res.status(200).send({ updatedMotherTransaction, createdTransactions });
    } catch (error) {
        console.error("Error updating mother transaction:", error);
        res.status(500).send({ error: error.message });
    }
};


const revertTransaction = async (transaction) => {
    const { fromClient, toClient, fromCurrency, toCurrency, deptedForUs, creditForUs } = transaction;

    // Revert the client and currency balances
    await Client.findByIdAndUpdate(fromClient._id, {
        $inc: { totalCredit: -(toShortNumber(creditForUs*fromCurrency.exchRate)) }
    });
    await Client.findByIdAndUpdate(toClient._id, {
        $inc: { totalDebt: -(toShortNumber(deptedForUs *toCurrency.exchRate))}
    });

    await Currency.findByIdAndUpdate(fromCurrency._id, {
        $inc: { credit: -creditForUs}
    });
    await Currency.findByIdAndUpdate(toCurrency._id, {
        $inc: { credit: deptedForUs }
    });
};

export const cancelTransaction = async (req, res) => {
    const transactionId = req.params.id;
    const userName = req.session.passport.user.userName;

    if (!transactionId || !mongoose.Types.ObjectId.isValid(transactionId)) {
        return res.status(400).send({ error: 'Invalid or missing transactionId' });
    }

    if (!userName || typeof userName !== 'string') {
        return res.status(400).send({ error: 'Invalid or missing userName' });
    }

    const handleCancellation = async (transaction, user, isMultiple = false) => {
        const deptedForUsNum = parseFloat(transaction.creditForUs) || 0;
        const creditForUsNum = parseFloat(transaction.deptedForUs) || 0;
        const shortResultInDollars = parseFloat(transaction.ResultInDollars * -1) || 0;
        const type = isMultiple ? "إلـغـاء" : "إلغاء";

        if (isNaN(deptedForUsNum) || isNaN(creditForUsNum) || isNaN(shortResultInDollars)) {
            throw new Error('Invalid numeric values during cancellation');
        }

        const fromClient = await Client.findById(transaction.toClient);
        const toClient = await Client.findById(transaction.fromClient);
        const fromCurrency = await Currency.findById(transaction.toCurrency);
        const toCurrency = await Currency.findById(transaction.fromCurrency);

        if (!fromClient || !toClient || !fromCurrency || !toCurrency) {
            throw new Error('One or more related entities not found');
        }

        // Create the cancellation transaction
        const newTransaction = new Transaction({
            _id: new mongoose.Types.ObjectId(),
            fromClient: fromClient._id,
            toClient: toClient._id,
            fromCurrency: fromCurrency._id,
            toCurrency: toCurrency._id,
            deptedForUs: deptedForUsNum,
            creditForUs: creditForUsNum,
            ResultInDollars: shortResultInDollars,
            description: `إلغاء حركة رقم ${transaction.transactionNumber}`,
            type: type,
            date: new Date().toLocaleString("en-US", {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }),
            fromClientName: fromClient.name,
            toClientName: toClient.name,
            fromNameCurrency: fromCurrency.nameInArabic,
            toNameCurrency: toCurrency.nameInArabic,
            user: user._id,
            userName: userName,
            transactionNumber: await generateTransactionNumber(),
            CancelID: transaction._id,
        });

        await newTransaction.save();

        // Update clients' and currencies' balances
        fromClient.totalDebt = parseFloat(fromClient.totalDebt || 0) + (creditForUsNum * fromCurrency.exchRate);
        toClient.totalCredit = parseFloat(toClient.totalCredit || 0) + (deptedForUsNum * toCurrency.exchRate);
        fromCurrency.credit = parseFloat(fromCurrency.credit || 0) + creditForUsNum;
        toCurrency.credit = parseFloat(toCurrency.credit || 0) - deptedForUsNum;

        if (isNaN(fromClient.totalDebt) || isNaN(toClient.totalCredit) || isNaN(fromCurrency.credit) || isNaN(toCurrency.credit)) {
            throw new Error('Invalid balance calculations');
        }

        await fromClient.save();
        await toClient.save();
        await fromCurrency.save();
        await toCurrency.save();

        // Update default clients for profit/loss
        const defaultClient = await Client.findOne({ name: "ارباح و الخسائر" });
        if (defaultClient) {
            if (shortResultInDollars > 0) {
                defaultClient.totalCredit += shortResultInDollars;
            } else {
                defaultClient.totalDebt += Math.abs(shortResultInDollars);
            }
            await defaultClient.save();
        }

        const dailyProfitLossClient = await Client.findOne({ name: "ارباح و الخسائر يومية" });
        if (dailyProfitLossClient) {
            if (shortResultInDollars > 0) {
                dailyProfitLossClient.totalCredit += shortResultInDollars;
            } else {
                dailyProfitLossClient.totalDebt += Math.abs(shortResultInDollars);
            }
            await dailyProfitLossClient.save();
        }

        return { fromClient, toClient, fromCurrency, toCurrency };
    };

    try {
        const transaction = await Transaction.findById(transactionId)
            .populate('fromClient', 'name totalDebt')
            .populate('toClient', 'name totalCredit')
            .populate('fromCurrency', 'nameInArabic exchRate credit')
            .populate('toCurrency', 'nameInArabic exchRate credit')
            .populate('user', 'username');

        if (!transaction) {
            return res.status(404).send({ error: 'Transaction not found' });
        }

        const user = await User.findOne({ username: userName });
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        let toSaveClients = new Set();
        let toSaveCurrencies = new Set();

        if (transaction.type === "متعددة") {
            const transactionNumber = transaction.transactionNumber;
            const transactions = await Transaction.find({ transactionNumber })
                .populate('fromClient', 'name totalDebt')
                .populate('toClient', 'name totalCredit')
                .populate('fromCurrency', 'nameInArabic exchRate credit')
                .populate('toCurrency', 'nameInArabic exchRate credit')
                .populate('user', 'username');

            if (!transactions || transactions.length === 0) {
                return res.status(404).send({ error: 'Transactions not found' });
            }

            await Promise.all(transactions.map((trans) => {
                trans.isCanceled = true;
                return trans.save();
            }));

            const cancellationPromises = transactions.map(async (trans) => {
                const { fromClient, toClient, fromCurrency, toCurrency } = await handleCancellation(trans, user, true);
                toSaveClients.add(fromClient);
                toSaveClients.add(toClient);
                toSaveCurrencies.add(fromCurrency);
                toSaveCurrencies.add(toCurrency);
            });

            await Promise.all(cancellationPromises);
            await Promise.all([...toSaveClients].map(client => client.save()));
            await Promise.all([...toSaveCurrencies].map(currency => currency.save()));

            await createNotification(userName, `${transactionNumber} :تم إلغاء حركة متعددة الرقم`, `${userName} تم إلغاء الحركة من قبل المستخدم`);
            return res.status(201).json({ message: 'All transactions successfully canceled' });
        } else {
            transaction.isCanceled = true;
            await transaction.save();

            const { fromClient, toClient, fromCurrency, toCurrency } = await handleCancellation(transaction, user, false);
            toSaveClients.add(fromClient);
            toSaveClients.add(toClient);
            toSaveCurrencies.add(fromCurrency);
            toSaveCurrencies.add(toCurrency);

            await Promise.all([...toSaveClients].map(client => client.save()));
            await Promise.all([...toSaveCurrencies].map(currency => currency.save()));

            await createNotification(userName, `${transaction.transactionNumber} :تم إلغاء حركة الرقم`, `${userName} تم إلغاء الحركة من قبل المستخدم`);
            return res.status(201).json();
        }
    } catch (error) {
        console.error("Error while canceling transaction:", error);
        return res.status(500).send({ error: 'An error occurred during transaction cancellation' });
    }
};


// export const deleteTransactionById = async (req, res) => {
//     try {
//         const transactionId = req.params.id;

//         // Check if the transaction ID is valid
//         if (!mongoose.Types.ObjectId.isValid(transactionId)) {
//             return res.status(400).send('Invalid transaction ID');
//         }

//         const transaction = await Transaction.findById(transactionId);
//         if (!transaction) {
//             console.log('Transaction not found with ID:', transactionId);
//             return res.status(404).send('Transaction not found');
//         }

//         const {
//             fromClient, toClient, fromCurrency, toCurrency,
//             ResultInDollars, creditForUs, deptedForUs,
//             type, CancelID, date
//         } = transaction;

//         // Remove the transaction
//         await transaction.deleteOne();

//         // Fetch client and currency documents
//         const fromClientDoc = await Client.findById(fromClient);
//         const toClientDoc = await Client.findById(toClient);
//         const fromCurrencyDoc = await Currency.findById(fromCurrency);
//         const toCurrencyDoc = await Currency.findById(toCurrency);

//         // Update fromClient and fromCurrency values
//         if (fromClientDoc && fromCurrencyDoc) {
//             fromClientDoc.totalDebt -= (creditForUs * fromCurrencyDoc.exchRate);
//             fromCurrencyDoc.credit -= creditForUs;
//             await fromClientDoc.save();
//             await fromCurrencyDoc.save();
//         }

//         // Update toClient and toCurrency values
//         if (toClientDoc && toCurrencyDoc) {
//             toClientDoc.totalCredit -= (deptedForUs * toCurrencyDoc.exchRate);
//             toCurrencyDoc.credit += deptedForUs;
//             await toClientDoc.save();
//             await toCurrencyDoc.save();
//         }

//         // Update default client for "ارباح و الخسائر"
//         const defaultClient = await Client.findOne({ name: "ارباح و الخسائر" });
//         if (defaultClient) {
//             if (ResultInDollars < 0) {
//                 defaultClient.totalDebt -= ResultInDollars;
//             } else {
//                 defaultClient.totalCredit -= ResultInDollars;
//             }
//             await defaultClient.save();
//         }

//         // Helper function to check if a date is today
//         const isToday = (someDate) => {
//             const today = new Date();
//             const dateObj = new Date(someDate);  // Convert to Date object
//             return (
//                 dateObj.getDate() === today.getDate() &&
//                 dateObj.getMonth() === today.getMonth() &&
//                 dateObj.getFullYear() === today.getFullYear()
//             );
//         };

//         // Update for daily "ارباح و الخسائر" client if the transaction date is today
//         if (isToday(transaction.date)) {
//             const defaultClient1 = await Client.findOne({ name: "ارباح و الخسائر يومية" });
//             if (defaultClient1) {
//                 if (ResultInDollars < 0) {
//                     defaultClient1.totalDebt -= ResultInDollars;
//                 } else {
//                     defaultClient1.totalCredit -= ResultInDollars;
//                 }
//                 // Update based on client names
//                 if (fromClientDoc?.name === "ارباح و الخسائر") {
//                     defaultClient1.totalDebt = toShortNumber(
//                         defaultClient1.totalDebt - (creditForUs * fromCurrencyDoc.exchRate), 2
//                     );
//                 }
//                 if (toClientDoc?.name === "ارباح و الخسائر") {
//                     defaultClient1.totalCredit = toShortNumber(
//                         defaultClient1.totalCredit - (deptedForUs * toCurrencyDoc.exchRate), 2
//                     );
//                 }
//                 await defaultClient1.save();
//             }
//         }

//         // Handle cancellation of a previous transaction
//         if (type === "إلغاء" && CancelID) {
//             const originalTransaction = await Transaction.findById(CancelID);
//             if (originalTransaction) {
//                 originalTransaction.isCanceled = false;  // Restore the original transaction
//                 await originalTransaction.save();
//             }
//         }

//         // Send a notification about the deletion
//         const sessionName = req.session.passport.user.userName;
        
//         let message = `${sessionName} من قبل المستخدم ${transaction.transactionNumber} تم حذف حركة الرقم
//         ${transaction.fromNameCurrency} ${transaction.creditForUs} ${transaction.fromClientName} من العميل
//         ${transaction.toNameCurrency} ${transaction.deptedForUs} ${transaction.toClientName} إلى العميل
//         ${transaction.ResultInDollars} نتيجة الحركة`

//         await createNotification(sessionName, `${transaction.transactionNumber} :تم حذف حركة الرقم` , `${sessionName} تم حذف الحركة من قبل المستخدم`)
//         // await createNotification(sessionName, `${transaction.transactionNumber} :تم حذف حركة الرقم`, message);
        

//         res.status(200).send('deleted');
//     } catch (error) {
//         console.log(error);
//         res.status(400).send(error.message);
//     }
// };




//getbyID


export const deleteTransactionById = async (req, res) => {
    

    try {
        const transactionId = req.params.id;
        

        // Validate the transaction
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Format dates
        const today = new Date().toISOString().slice(0, 10); // Format to YYYY-MM-DD
        const transactionDate = new Date(transaction.date).toISOString().slice(0, 10); // Convert transaction date to YYYY-MM-DD
        
        

        const isToday = transactionDate === today;
        

        // Handle linked transactions (if any)
        const linkedTransactions = await Transaction.find({ transactionNumber: transaction.transactionNumber});
        

        // First, delete all linked transactions
        for (const linkedTransaction of linkedTransactions) {
            const {
                CancelID,
                fromClient,
                toClient,
                fromClientName,
                toClientName,
                fromCurrency,
                toCurrency,
                deptedForUs,
                creditForUs,
            } = linkedTransaction;

            

            // Fetch associated documents
            const fromClientDoc = await Client.findById(fromClient);
            const toClientDoc = await Client.findById(toClient);
            const fromCurrencyDoc = await Currency.findById(fromCurrency);
            const toCurrencyDoc = await Currency.findById(toCurrency);

            // Log fetched documents
            
            
            
            

            if (fromClientDoc && toClientDoc && fromCurrencyDoc && toCurrencyDoc) {
                fromClientDoc.totalDebt -= creditForUs * fromCurrencyDoc.exchRate;
                toClientDoc.totalCredit -= deptedForUs * toCurrencyDoc.exchRate;
                fromCurrencyDoc.credit -= creditForUs;
                toCurrencyDoc.credit += deptedForUs;

                await fromClientDoc.save();
                await toClientDoc.save();
                await fromCurrencyDoc.save();
                await toCurrencyDoc.save();

                // Skip default client updates if toClientName is "حسابات متعددة"
                if (toClientName !== "حسابات متعددة") {
                    await updateDefaultClientsOnDelete(linkedTransaction, isToday);
                }
            }

            // Handle CancelID
            if (linkedTransaction.CancelID) {
                
                const cancelTransaction = await Transaction.findById(linkedTransaction.CancelID);
                
                if (cancelTransaction) {
                    cancelTransaction.isCanceled = false;
                    await cancelTransaction.save();
                    
                } else {
                    
                }
            }

            // Delete the linked transaction
            await Transaction.findByIdAndDelete(linkedTransaction._id);
            
        }

        // Delete the original transaction
        await Transaction.findByIdAndDelete(transactionId);
        

        // Respond with success
        return res.status(200).json({ message: 'Transaction and all linked transactions deleted successfully' });

    } catch (error) {
        console.error('Error deleting transaction:', error.message);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const updateDefaultClientsOnDelete = async (transaction, isToday) => {
    const {
        fromClientName,
        toClientName,
        fromCurrency,
        toCurrency,
        deptedForUs,
        creditForUs,
        ResultInDollars
    } = transaction;

    // Fetch default clients
    const defaultClient = await Client.findOne({ name: "ارباح و الخسائر" });
    const defaultClient1 = await Client.findOne({ name: "ارباح و الخسائر يومية" });

    // Fetch currencies
    const fromCurrencyDoc = await Currency.findById(fromCurrency);
    const toCurrencyDoc = await Currency.findById(toCurrency);

    if (defaultClient) {
        // Update defaultClient based on ResultInDollars
        if (ResultInDollars < 0) {
            defaultClient.totalDebt -= Math.abs(ResultInDollars);
        } else {
            defaultClient.totalCredit -= ResultInDollars;
        }
        await defaultClient.save();
    }

    if (defaultClient1 && isToday) {
        // Update defaultClient1 if transaction is today
        if (ResultInDollars < 0) {
            defaultClient1.totalDebt -= Math.abs(ResultInDollars);
        } else {
            defaultClient1.totalCredit -= ResultInDollars;
        }
        if (fromClientName === "ارباح و الخسائر") {
            defaultClient1.totalDebt = toShortNumber(defaultClient1.totalDebt - (creditForUs * fromCurrencyDoc.exchRate), 2);
        }
        if (toClientName === "ارباح و الخسائر") {
            defaultClient1.totalCredit = toShortNumber(defaultClient1.totalCredit - (deptedForUs * toCurrencyDoc.exchRate), 2);
        }
        await defaultClient1.save();
    }
};


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
        const user = req.session.passport.user;

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
        const result = await Transaction.find({
            $and:{_id: { $in: ids }},
            })
        
        


            const formattedResults = result.map(transaction => {
                const formattedDate = new Date(transaction.date).toLocaleString("en-US", {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
            
                return {
                    ...transaction._doc,
                    date: formattedDate
                };
            });


        let totalCreditForUs = 0;
        let totalDeptedForUs = 0;

            formattedResults.forEach(transaction => {
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


        
        res.json({transactions: formattedResults, account: account, total: total, info: ids});

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
    try {

        const ids = req.body.ids;

        const account = {
            clientName: req.body.clientName,
            currencyName: req.body.currencyName
        }



        let startDate = new Date();
        startDate.setHours(0,0,0,0);

        let endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        console.log(req.body);

        if (req.body.startDate != '') {
            startDate = new Date(req.body.startDate);
            startDate.setHours(0,0,0,0)
        }
        
        
        if (req.body.endDate != '') {
            endDate = new Date(req.body.endDate);
            endDate.setHours(23, 59, 59, 999)
        }
        
        
        console.log('start:',startDate)
        console.log('end:',endDate)
        
        // Query transactions
        const result = await Transaction.find({
            _id: { $in: ids }, // Ensure ids is an array of ObjectIds
            date: {
                $gte: startDate, // Make sure startDate is a valid Date object
                $lte: endDate    // Make sure endDate is a valid Date object
            },
            type: {
                $regex: req.body.type
            }
        })        
        .populate([
            { path: 'fromClient', select: 'name' },
            { path: 'toClient', select: 'name' },
            { path: 'fromCurrency', select: 'nameInArabic' },
            { path: 'toCurrency', select: 'nameInArabic' }
        ]);
        


        const formattedResults = result.map(transaction => {
            const formattedDate = new Date(transaction.date).toLocaleString("en-US", {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        
            return {
                ...transaction._doc,
                date: formattedDate
            };
        });


        let totalCreditForUs = 0;
        let totalDeptedForUs = 0;

            formattedResults.forEach(transaction => {
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

        res.json({transactions: formattedResults, account: account, total: total, info: ids});

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
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



//check function
export const checkTransaction = async (req, res) => {
    try {
        const transactionID = req.params.id;
        console.log(req.params.id);

        const transaction = await Transaction.findById(transactionID);
        if (transaction.checked) {
            transaction.checked = false;
        } else {
            transaction.checked = true;
        }

        await transaction.save();
        res.json(transaction);

    } catch (error) {
        console.log(error);
        res.send(error.message);
    }
}



export const getLinkedTrans = async (req, res) => {
    try {
        
        const clients = await Client.find();
        const currencies = await Currency.find();

        const Mother = await Transaction.findById(req.params.id);

        
        if (!Mother) {
            return res.status(404).json({ message: "Mother transaction not found" });
        }

        
        const transaction = await Transaction.find({
            transactionNumber: Mother.transactionNumber,
            fromClientName: { $ne: "حسابات متعددة" }
        });


        
        res.status(200).render('financial-management/update-reconciliation.ejs', {transaction, clients, currencies});

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

//************************************************************************ page handling

export const getGeneralBudget = async (req, res) => {
    try {
        if (req.isAuthenticated()) {

            const clients = await Client.find();


            const result = clients.map(client => {
                let balance = 0;
                if (client.name === 'ارباح و الخسائر' || client.name === 'ارباح و الخسائر يومية')
                    balance = client.totalCredit - client.totalDebt;
                else 
                    balance = client.totalDebt - client.totalCredit;


                let newBalance = 0;
                if ( balance < 0) {
                    newBalance = balance;
                    balance = 0;
                }

                return {
                    _id: client._id,
                    name: client.name,
                    totalDebt: +client.totalDebt.toFixed(3),
                    totalCredit: +client.totalCredit.toFixed(3),
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
                if (client.name == 'ارباح و الخسائر يومية' || client.name == 'ارباح و الخسائر') {
                    total.DebtOnUs += 0;
                    total.CreditOnUs += 0;
                    total.balanceDebt += 0;
                    total.balanceCredit += 0;
                } else {
                    total.DebtOnUs += +client.totalDebt.toFixed(3);
                    total.CreditOnUs += +client.totalCredit.toFixed(3);
                    total.balanceDebt += +client.balanceDebt;
                    total.balanceCredit += +client.balanceCredit;
                }


            });
            

            total.balanceDebt = +total.balanceDebt.toFixed(3);
            total.balanceCredit = +total.balanceCredit.toFixed(3);


            total.balanceCredit = Math.abs(total.balanceCredit)
            total.balanceDebt = Math.abs(total.balanceDebt)

            total.diff =  +total.balanceDebt.toFixed(2) - +total.balanceCredit.toFixed(2);
            total.diff = +total.diff.toFixed(3)

            res.render('financial-management/general-budget.ejs', {clients: result, total: total});
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        res.send("error")
    }
}


export const getGeneralBudgetByPriority = async (req, res) => {
    try {
        if (req.isAuthenticated()) {

            const priority = req.params.priority;

            const clients = await Client.find({priorityCli: priority});


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
                    totalDebt: +client.totalDebt.toFixed(3),
                    totalCredit: +client.totalCredit.toFixed(3),
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
            total.diff = +total.diff.toFixed(3)

            res.render('financial-management/general-budget.ejs', {clients: result, total: total});
        
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error);
        res.send(error.message)
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

            

            res.render('financial-management.ejs', {currencies: currencies, total: total, userName: req.session.passport.user.userName});


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
            const clients = await Client.find().sort({ priorityCli: 1 });
            const currencies = await Currency.find().sort({ priorityCu: 1 });
            let transaction = null;

            // Check if the id param exists and is a valid ID
            if (req.body.id && req.body.id.length > 0) {
                transaction = await Transaction.findById(req.body.id);
                console.log("Transaction found:", transaction);
            }
            
            // Render the page with or without the transaction data
            res.render('financial-management/reconciliation.ejs', {
                transaction: transaction,  // Will be null if no transaction is found
                currencies: currencies,
                clients: clients,
                userName: req.session.passport?.user?.userName
            });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(500).send("An error occurred while fetching reconciliation data.");
    }
};


export const getUpdateReconciliation = async (req, res) => {
    if (req.isAuthenticated()) {
        try {

            const result = await Transaction.findById(req.params.id);
            const clients = await Client.find().sort({ priorityCli: 1 });
            const currencies = await Currency.find().sort({ priorityCu: 1 });



            res.render('financial-management/update-reconciliation.ejs', {
                transaction: result,
                currencies: currencies,
                clients: clients,
                userName: req.session.passport?.user?.userName
            });

        } catch (error) {
            console.log(error);
            res.send(error.message)
        }
    } else {
        res.redirect('/login')
    }
}


export const getJournal = async (req, res) => {
    try {
        if (req.isAuthenticated()) {

            const users = await User.find();

            const startDate = new Date();
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999);


            const result = await Transaction.find({
                date: {
                    $gte: startDate,
                    $lte: endDate
                },
                $or: [
                    { 
                        $and: [
                            { type: { $ne: "متعددة" } }, 
                            { type: { $ne: "إلـغـاء" } }
                        ]
                    },
                    { fromClientName: "حسابات متعددة" }
                ]
            })
            .populate('fromClient', 'name')
            .populate('toClient', 'name')
            .populate('fromCurrency', 'nameInArabic')
            .populate('toCurrency', 'nameInArabic')
            .populate('user', 'username');
            


            const formattedResults = result.map(transaction => {
                const formattedDate = new Date(transaction.date).toLocaleString("en-US", {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
            
                return {
                    ...transaction._doc,
                    date: formattedDate
                };
            });



            res.render('financial-management/journal.ejs', {transactions: formattedResults, users: users});
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error)
        res.send(error.message)
    }
}



export const getJournalByDate = async (req, res) => {
    if (req.isAuthenticated()) {
        try {


            const users = await User.find();
           

            let user = '';
            let startDate = new Date();
            startDate.setHours(0,0,0,0);

            let endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            



            if (req.body.startDate) {
                startDate = new Date(req.body.startDate);
                startDate.setHours(0,0,0,0)
            }


            if (req.body.endDate) {
               endDate = new Date(req.body.endDate);
               endDate.setHours(23, 59, 59, 999)
            }
 

            if (req.body.user) {
                user = req.body.user;
            }

            

            const result = await Transaction.find({
                date: {
                    $gte: startDate,
                    $lte: endDate
                },
                userName: {
                    $regex: new RegExp(user, 'i') // Case-insensitive matching
                },
                $or: [
                    { 
                        $and: [
                            { type: { $ne: "متعددة" } }, 
                            { type: { $ne: "إلـغـاء" } }
                        ]
                    },
                    { fromClientName: "حسابات متعددة" }
                ]
            });
            



            const formattedResults = result.map(transaction => {
                const formattedDate = new Date(transaction.date).toLocaleString("en-US", {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
            
                return {
                    ...transaction._doc,
                    date: formattedDate
                };
            });


            res.render('financial-management/journal.ejs', { transactions: formattedResults, users: users });

        } catch (error) {
            console.log(error);
            res.send(error.message);
        }
    } else {
        res.redirect('/login');
    }
};


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
            console.log(req.query)

            const {transaction, total, account, info} = req.query;



            res.render('financial-management/account-statment.ejs', {
                transactions: JSON.parse(transaction),
                account: JSON.parse(account),
                total: JSON.parse(total), 
                info: JSON.parse(info)
            });
        } else {
            res.redirect('/login')
        }

    } catch(error) {
        console.log(error)
        res.send(error.message)
    }
}