import express from 'express';
import {
    archiveTransaction,
    createTransaction,
    deleteTransactionById,
    getTransactionById,
    getTransactionsByClient,
    getTransactionsByClientGroupedByCurrency,
    getTransactionsByCurrency,
    getTransactionsByNames,
    getTransactionsByNamesAndDate,
    unarchiveTransaction,
    updateTransaction
} from '../controllers/transactionControllers.js';

const router = express.Router();


router.post('/new', createTransaction);


router.put('/update/:id', updateTransaction);

// Route to get a transaction by its ID
router.get('/get/:id', getTransactionById);

// Route to get transactions by client name
router.get('/by-client/:clientName', getTransactionsByClient);

// Route to get transactions by currency name
router.get('/by-currency/:currencyNameInArabic', getTransactionsByCurrency);

// Route to delete a transaction by its ID
router.delete('/delete/:id', deleteTransactionById);

//grouped by currency
router.get('/by-client-gr-currency/:clientName', getTransactionsByClientGroupedByCurrency);

//grouped by client
router.get('/by-currency-gr-client/:clientName', getTransactionsByClientGroupedByCurrency);

//archive
router.patch('/update/:id/archive', archiveTransaction);

//unarchive
router.patch('/update/:id/unarchive', unarchiveTransaction);

// Get transactions based on client names and currency names
router.post('/transactions-by-names', getTransactionsByNames);

// Get transactions based on client names and currency names and date
router.post('/transactions-by-names-and-date', getTransactionsByNamesAndDate);


export default router;
