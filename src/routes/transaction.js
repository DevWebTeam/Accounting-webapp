const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');

// Create a new transaction
router.post('/new', async (req, res) => {
try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).send(transaction);
} catch (error) {
    res.status(400).send(error);
}
});

// Get all transactions
router.get('/GetAll', async (req, res) => {
try {
const transactions = await Transaction.find()
        .populate('fromClient')
        .populate('toClient')
        .populate('fromCurrency')
        .populate('toCurrency')
        .populate('user');
    res.status(200).send(transactions);
} catch (error) {
        res.status(500).send(error);
}
});

// Get a transaction by ID
router.get('/Get/:id', async (req, res) => {
try {
    const transaction = await Transaction.findById(req.params.id)
        .populate('fromClient')
        .populate('fromCurrency')
        .populate('toClient')
        .populate('toCurrency')
        .populate('user');
    if (!transaction) {
    return res.status(404).send();
    }
    res.status(200).send(transaction);
} catch (error) {
    res.status(500).send(error);
}
});

// Update a transaction by ID
router.put('/update/:id', async (req, res) => {
try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate('fromClient')
        .populate('toClient')
        .populate('fromCurrency')
        .populate('toCurrency')
        .populate('user');
    if (!transaction) {
        return res.status(404).send();
    }
    res.status(200).send(transaction);
} catch (error) {
    res.status(400).send(error);
}
});

// Archive a transaction by ID
router.patch('/update/:id/archive', async (req, res) => {
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
});

// Unarchive a transaction by ID
router.patch('/updae/:id/unarchive', async (req, res) => {
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
});

// Delete a transaction by ID
router.delete('/delete/:id', async (req, res) => {
try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
    return res.status(404).send();
    }
    res.status(200).send(transaction);
} catch (error) {
    res.status(500).send(error);
}
});

module.exports = router;
