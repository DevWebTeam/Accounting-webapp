import Currency from '../models/currency.js';
import bodyParser from 'body-parser';
import express from "express";
import {createNotification} from './notificationsControllers.js';

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
            const currency = await Currency.findByIdAndUpdate(req.params.id , req.body, { new: true, runValidators: true });

            const sessionName = req.session.passport.user.userName;        
            await createNotification(sessionName, `تم تحديث عملة ${currency.nameInArabic}` , `${sessionName} :تم تحديث العملة من قبل المستخدم`)

            res.status(200).json({message: "patch successeful"})
        } else {
            res.redirect("/login");
        }
    } catch (error) {
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