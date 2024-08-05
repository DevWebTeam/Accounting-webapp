const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

// MongoDB connection
require('./configs/connects');

// Import models
const User = require('./models/user');
const Notification = require('./models/notification');
const Client = require('./models/client');
const Transaction = require('./models/transaction');
const Currency = require('./models/currency');

// Import routes
const newLocal = './routes/user';
const userRoutes = require(newLocal);
const notificationRoutes = require('./routes/notification');
const clientRoutes = require('./routes/client');
const transactionRoutes = require('./routes/transaction');
const currencyRoutes = require('./routes/currency');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/currencies', currencyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
