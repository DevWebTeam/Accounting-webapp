const express = require('express');
const router = express.Router();
const Currency = require('../models/currency');

// Create a new currency
router.post('/new', async (req, res) => {
    try {
    const currency = new Currency(req.body);
    await currency.save();
    res.status(201).send(currency);
    } catch (error) {
    res.status(400).send(error);
    }
});

// Get all currencies
router.get('/GetAll', async (req, res) => {
    try {
    const currencies = await Currency.find();
    res.status(200).send(currencies);
    } catch (error) {
    res.status(500).send(error);
    }
});

// Get a currency by ID
router.get('/get/:id', async (req, res) => {
    try {
    const currency = await Currency.findById(req.params.id);
    if (!currency) {
        return res.status(404).send();
    }
    res.status(200).send(currency);
    } catch (error) {
    res.status(500).send(error);
    }
});

// Update a currency by ID
router.put('/update/:id', async (req, res) => {
    try {
    const currency = await Currency.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!currency) {
        return res.status(404).send();
    }
    res.status(200).send(currency);
    } catch (error) {
    res.status(400).send(error);
    }
});

//patch for currency
router.patch('/patch/:id/update', async (req, res) => {
    try {
        const { operation, priceInDollar } = req.body;
        const updates = {};
        
        if (operation) {
        if (!['multiply', 'divide'].includes(operation)) {
            return res.status(400).send({ error: 'Invalid operation. Must be "multiply" or "divide".' });
        }
        updates.operation = operation;
        }
        
        if (priceInDollar !== undefined) {
        if (typeof priceInDollar !== 'number') {
            return res.status(400).send({ error: 'priceInDollar must be a number.' });
        }
        updates.priceInDollar = priceInDollar;
        }
        
        if (Object.keys(updates).length === 0) {
        return res.status(400).send({ error: 'At least one field (operation or priceInDollar) must be provided for update.' });
        }
        
        const currency = await Currency.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!currency) {
        return res.status(404).send();
        }
        res.status(200).send(currency);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a currency by ID
router.delete('/delete/:id', async (req, res) => {
    try {
    const currency = await Currency.findByIdAndDelete(req.params.id);
    if (!currency) {
        return res.status(404).send();
    }
    res.status(200).send(currency);
    } catch (error) {
    res.status(500).send(error);
    }
});

module.exports = router;
