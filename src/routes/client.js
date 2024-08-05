const express = require('express');
const router = express.Router();
const Client = require('../models/client');

// Create a new client
router.post('/new', async (req, res) => {
    try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).send(client);
    } catch (error) {
    res.status(400).send(error);
    }
});

// Get all clients
router.get('/get', async (req, res) => {
    try {
    const clients = await Client.find();
    res.status(200).send(clients);
    } catch (error) {
    res.status(500).send(error);
    }
});

// Get a client by ID
router.get('/update/:id', async (req, res) => {
    try {
    const client = await Client.findById(req.params.id);
    if (!client) {
        return res.status(404).send();
    }
    res.status(200).send(client);
    } catch (error) {
    res.status(500).send(error);
    }
});

// Update a client by ID
router.put('/update/:id', async (req, res) => {
    try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!client) {
        return res.status(404).send();
    }
    res.status(200).send(client);
    } catch (error) {
    res.status(400).send(error);
    }
});

// Delete a client by ID
router.delete('/delete/:id', async (req, res) => {
    try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
        return res.status(404).send();
    }
    res.status(200).send(client);
    } catch (error) {
    res.status(500).send(error);
    }
});

module.exports = router;
