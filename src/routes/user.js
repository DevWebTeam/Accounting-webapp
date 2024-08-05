const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Create a new user
router.post('/new', async (req, res) => {
try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
} catch (error) {
    res.status(400).send(error);
}
});

// Get all users
router.get('/GetAll', async (req, res) => {
try {
    const users = await User.find();
    res.status(200).send(users);
} catch (error) {
    res.status(500).send(error);
}
});

// Get a user by ID
router.get('/Get/:id', async (req, res) => {
try {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).send();
    }
    res.status(200).send(user);
    } catch (error) {
    res.status(500).send(error);
    }
});

// Update a user by ID
router.put('/update/:id', async (req, res) => {
    try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) {
        return res.status(404).send();
    }
    res.status(200).send(user);
    } catch (error) {
    res.status(400).send(error);
    }
});

// Update a user's role by ID "SALAHIYAT"
router.patch('/update/:id/role', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
        return res.status(404).send();
        }
        user.role = req.body.role;
        await user.save();
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
    });

// Delete a user by ID
router.delete('/delete/:id', async (req, res) => {
    try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return res.status(404).send();
    }
    res.status(200).send(user);
    } catch (error) {
    res.status(500).send(error);
    }
});

module.exports = router;
