import express from 'express';
import {
    /*     archiveTransactionById, */
    createTransaction,
} from '../controllers/transactionControllers.js';

const router = express.Router();


router.post('/new', createTransaction);
/* 
router.get('/GetAll', getAllTransactions);

router.get('/Get/:id', getTransactionById);

router.get('/by-currency/:currencyNameInArabic', getTransactionsByCurrency);

router.get('/by-client/:clientName', getTransactionsByClient);

router.get('/transactions/client/:clientName', getTransactionsByClientGroupedByCurrency);

router.put('/update/:id', updateTransactionById);

router.patch('/update/:id/archive', archiveTransactionById);

router.patch('/update/:id/unarchive', unarchiveTransactionById);

router.delete('/delete/:id', deleteTransactionById); */

export default router;
