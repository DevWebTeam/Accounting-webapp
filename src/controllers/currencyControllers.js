import Currency from '../models/currency.js';

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
        res.status(200).send(currencies);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Get a currency by ID
export const getCurrencyById = async (req, res) => {
    try {
        const currency = await Currency.findById(req.params.id);
        if (!currency) {
            return res.status(404).send();
        }
        
        res.status(200).send(currency);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Get a currency by name in English or name in Arabic
export const getCurrencyByName = async (req, res) => {
    try {
        const currency = await Currency.findOne({
            $or: [{ nameInEnglish: req.params.name }, { nameInArabic: req.params.name }]
        });
        if (!currency) {
            return res.status(404).send();
        }
        res.status(200).send(currency);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Update a currency by ID
export const updateCurrencyById = async (req, res) => {
    try {
        const currency = await Currency.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true });
        if (!currency) {
            return res.status(404).send();
        }
        res.status(200).send(currency);
    } catch (error) {
        res.status(400).send(error);
    }
};



// Delete a currency by ID
export const deleteCurrencyById = async (req, res) => {
    try {
        const currency = await Currency.findByIdAndDelete(req.params.id);
        if (!currency) {
            return res.status(404).send();
        }
        res.status(200).send(currency);
    } catch (error) {
        res.status(500).send(error);
    }
};
