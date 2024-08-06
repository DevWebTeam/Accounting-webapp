import Currency from '../models/currency.js';
import bodyParser from 'body-parser';
import express from "express";

const controller = express();
controller.use(bodyParser.urlencoded({extended: true}));
controller.use(express.json());





// Create a new currency
export const createCurrency = async (req, res) => {
    try {
        const currency = new Currency(req.body);
        await currency.save();
        res.status(201).send(currency);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Get all currencies
export const getAllCurrencies = async (req, res) => {
    try {
        const currencies = await Currency.find();
        const data = currencies.map(currency => {
            return {
                _id: currency._id,
                icon: currency.icon,
                nameInArabic: currency.nameInArabic,
                code: currency.code,
                exchRate: currency.exchRate,
                priorityCu: currency.priorityCu
            }
        })

        console.log(data)
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Get a currency by ID
export const getCurrencyById = async (req, res) => {
    try {
        
        console.log("\nreq params:", req.params);
        const currency = await Currency.findById(req.params.id);
        console.log("\nquery result:", currency);
        
        res.status(200).json(currency);

    } catch (error) {
        console.log("Error:", error.message);
        res.status(500).json("error fetching currency");
    }
};


// Patch for currency all fields required
export const patchCurrencyById = async (req, res) => {
    try {

        const updates = req.body;
        console.log(updates);
        
        const currency = await Currency.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        

        res.status(200).json(currency);
    } catch (error) {
        res.status(400).json(error.message);
    }
};

// Delete a currency by ID
export const deleteCurrencyById = async (req, res) => {
    try {
        console.log(req.params);
        const result = await Currency.findByIdAndDelete(req.params.id);
        console.log(result);


        res.status(200).redirect("/currencies");
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export default {
    createCurrency,
    getAllCurrencies,
    getCurrencyById,
    patchCurrencyById,
    deleteCurrencyById
};