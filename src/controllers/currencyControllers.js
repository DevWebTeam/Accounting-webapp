

import bodyParser from 'body-parser';
import express from "express";
import { DateTime } from 'luxon';
import Client from '../models/client.js';
import Currency from '../models/currency.js';
import Transaction from '../models/transaction.js';
import { createNotification } from './notificationsControllers.js';


const controller = express();
controller.use(bodyParser.urlencoded({extended: true}));
controller.use(express.json());








// Create a new currency
export const createCurrency = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const newcurrency = new Currency(req.body);
            await newcurrency.save();
            res.status(201).redirect("/currencies");
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};






// Get all currencies
export const getAllCurrencies = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const result = await Currency.find().sort({priorityCu: 1});


            res.status(200).render("currency-management.ejs", {currencies: result, userName: req.session.passport.user.userName});
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};


export const getAllCurrenciesAsJson = async (req, res) => {
    try {
        const result = await Currency.find().sort({priorityCu: 1});
        res.json(result);
    } catch (error) {
        console.log(error)
        res.error(error.message);
    }
}





// Get a currency by ID
export const getCurrencyById = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const currency = await Currency.findById(req.params.id);   
            console.log(currency);         
            res.status(200).json(currency);
        } else {
            res.redirect("/login")
        }

    } catch (error) {
        console.log("Error:", error.message);
        res.status(500).json(error.message);
    }
};





// Patch for currency all fields required


export const patchCurrencyById = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const currencyId = req.params.id;
            const updates = req.body;

            
            // Fetch the old currency details before updating
            const oldCurrency = await Currency.findById(currencyId);
            if (!oldCurrency) {
                
                return res.status(404).send("Currency not found");
            }

            
            // Update the currency
            const currency = await Currency.findByIdAndUpdate(currencyId, updates, { new: true, runValidators: true });

            
            const dif = currency.exchRate - oldCurrency.exchRate;

            // Update all transactions where this currency is the "toCurrency"
            
            const transactionsToUpdate = await Transaction.find({ toCurrency: currency._id });

            for (const transaction of transactionsToUpdate) {
                const deptedForUs = transaction.deptedForUs || 0; // Default to 0 if undefined
                if (deptedForUs === undefined) {
                    
                    continue;
                }

                let sum = deptedForUs * dif;
                
                transaction.ResultInDollars -= sum;

                const toClient = await Client.findById(transaction.toClient);
                if (toClient) {
                    toClient.totalCredit += sum;
                    await toClient.save();
                    
                }

                if (transaction.type === "إلـغـاء" || transaction.type === "متعددة") {
                    const mumTransaction = await Transaction.findOne({ transactionNumber: transaction.transactionNumber });
                    if (mumTransaction) {
                        const mumDeptedForUs = mumTransaction.deptedForUs || 0; // Default to 0 if undefined
                        mumTransaction.deptedForUs = mumDeptedForUs + sum;
                        mumTransaction.ResultInDollars -= sum;
                        await mumTransaction.save();
                        
                    }
                }

                const defaultClient = await Client.findOne({ name: "ارباح و الخسائر" });
                const defaultClient1 = await Client.findOne({ name: "ارباح و الخسائر يومية" });

                if (transaction.ResultInDollars > 0) {
                    if (defaultClient) defaultClient.totalCredit -= sum;
                    if (transaction.date === DateTime.local().toISODate() && defaultClient1) {
                        defaultClient1.totalCredit -= sum;
                    }
                } else {
                    if (defaultClient1) defaultClient1.totalDebt += sum;
                    if (transaction.date === DateTime.local().toISODate() && defaultClient1) {
                        defaultClient1.totalDebt -= sum;
                    }
                }

                if (transaction.date === DateTime.local().toISODate() && toClient && defaultClient && toClient._id.equals(defaultClient._id)) {
                    if (defaultClient1) defaultClient1.totalCredit += sum;
                }

                if (defaultClient) await defaultClient.save();
                if (defaultClient1) await defaultClient1.save();
                await transaction.save();
                
            }

            // Update all transactions where this currency is the "fromCurrency"
            
            const transactionsFromUpdate = await Transaction.find({ fromCurrency: currency._id });

            for (const transaction of transactionsFromUpdate) {
                const creditForUs = transaction.creditForUs || 0; // Default to 0 if undefined
                if (creditForUs === undefined) {
                    
                    continue;
                }

                let sum = creditForUs * dif;
                
                transaction.ResultInDollars += sum;

                const fromClient = await Client.findById(transaction.fromClient);
                if (fromClient) {
                    fromClient.totalDebt += sum;
                    await fromClient.save();
                    
                }

                if (transaction.type === "إلـغـاء" || transaction.type === "متعددة") {
                    const mumTransaction = await Transaction.findOne({ transactionNumber: transaction.transactionNumber });
                    if (mumTransaction) {
                        const mumCreditForUs = mumTransaction.creditForUs || 0; // Default to 0 if undefined
                        mumTransaction.creditForUs = mumCreditForUs + sum;
                        mumTransaction.resultInDollars += sum;
                        await mumTransaction.save();
                        
                    }
                }

                const defaultClient = await Client.findOne({ name: "ارباح و الخسائر" });
                const defaultClient1 = await Client.findOne({ name: "ارباح و الخسائر يومية" });

                if (transaction.resultInDollars < 0) {
                    if (defaultClient) defaultClient.totalCredit -= sum;
                    if (transaction.date === DateTime.local().toISODate() && defaultClient1) {
                        defaultClient1.totalCredit -= sum;
                    }
                } else {
                    if (defaultClient1) defaultClient1.totalDebt += sum;
                    if (transaction.date === DateTime.local().toISODate() && defaultClient1) {
                        defaultClient1.totalDebt -= sum;
                    }
                }

                if (transaction.date === DateTime.local().toISODate() && fromClient && defaultClient && fromClient._id.equals(defaultClient._id)) {
                    if (defaultClient1) defaultClient1.totalDebt += sum;
                }

                if (defaultClient) await defaultClient.save();
                if (defaultClient1) await defaultClient1.save();
                await transaction.save();
                
            }

            // Log the notification
            const sessionName = req.session.passport.user.userName;
            
            

            res.status(200).json({ message: "Patch successful" });
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.error("Error in patchCurrencyById:", error);
        res.status(400).send(error.message);
    }
};








// Delete a currency by ID
export const deleteCurrencyById = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            console.log(req.params);
            const currency = await Currency.findByIdAndDelete(req.params.id);

            const sessionName = req.session.passport.user.userName;        
            await createNotification(sessionName, `${currency.nameInArabic} تم حذف عملة` , `${sessionName} :تم حذف العملة من قبل المستخدم`)


            res.status(200).json({message: "delete successful"});
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
};




export default {
    createCurrency,
    getAllCurrencies,
    getCurrencyById,
    patchCurrencyById,
    deleteCurrencyById,
    getAllCurrenciesAsJson
};