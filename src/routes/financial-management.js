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
    updateTransaction,
    getGeneralBudget,
    getFinances,
    getReconciliation,
    getJournal,
    getLedger,
    getLedgerAccount,
    getTransactionsByCurrencyGroupedByClient,
    cancelTransaction,
    getJournalByDate
} from '../controllers/transactionControllers.js';

import {checkIfAuthorized} from '../controllers/functions.js'

const router = express.Router();




router.get('/', getFinances);

router.get('/general-budget', getGeneralBudget);

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!     ledger
router.get('/ledger', getLedger);

router.get('/ledger/currencies/:clientName', getTransactionsByClientGroupedByCurrency);

router.post('/ledger/currencies/client', getTransactionsByNames);

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!    journal
router.get("/journal", getJournal);

router.patch("/journal/update", updateTransaction);

router.post("/journal/cancel/:id", checkIfAuthorized('admin', 'manager') ,cancelTransaction);

router.delete("/journal/delete/:id", deleteTransactionById);

router.post("/journal/date", getJournalByDate);

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!    reconciliation
router.get("/reconciliation", getReconciliation);

//create transaction
router.post('/reconciliation/new', createTransaction);




export default router;