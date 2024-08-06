import express from 'express';
import {
    archiveTransactionById,
    createTransaction,
    deleteTransactionById,
    getAllTransactions,
    getTransactionById,
    getTransactionsByClient,
    getTransactionsByCurrency,
    unarchiveTransactionById,
    updateTransactionById
} from '../controllers/transaction.js';

const router = express.Router();


router.post('/new', createTransaction);

router.get('/GetAll', getAllTransactions);

router.get('/Get/:id', getTransactionById);

router.get('/by-currency/:currencyNameInArabic', getTransactionsByCurrency);

router.get('/by-client/:clientName', getTransactionsByClient);

router.put('/update/:id', updateTransactionById);

router.patch('/update/:id/archive', archiveTransactionById);

router.patch('/update/:id/unarchive', unarchiveTransactionById);

router.delete('/delete/:id', deleteTransactionById);

export default router;
