import express from 'express';
import {
    archiveTransaction,
    createTransaction,
    createMultipleTransactions,
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
    getUpdateReconciliation,
    getJournal,
    getLedger,
    getLedgerAccount,
    getTransactionsByCurrencyGroupedByClient,
    cancelTransaction,
    getJournalByDate,
    checkTransaction,
    getGeneralBudgetByPriority
} from '../controllers/transactionControllers.js';

import {checkIfAuthorized} from '../controllers/functions.js'

const router = express.Router();




router.get('/', getFinances);

router.get('/general-budget', getGeneralBudget);


router.get('/general-budget/:priority', getGeneralBudgetByPriority);

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!     ledger
router.get('/ledger', getLedger);

router.get('/ledger/currencies/:clientName', getTransactionsByClientGroupedByCurrency);

router.post('/ledger/currencies/client', getTransactionsByNames);

router.get('/ledger/account-statement', getLedgerAccount)

router.post('/ledger/currencies/client/date', getTransactionsByNamesAndDate);

router.post('/ledeger/currencies/client/:id', checkTransaction);

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!    journal
router.get("/journal", getJournal);

router.patch("/journal/update", updateTransaction);

router.post("/journal/cancel/:id", checkIfAuthorized('admin', 'manager') ,cancelTransaction);

router.delete("/journal/delete/:id", deleteTransactionById);

router.post("/journal/date", getJournalByDate);

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!    reconciliation
router.get("/reconciliation", getReconciliation);


router.get("/update-reconciliation/:id", getUpdateReconciliation);

//create transaction (recon / move)
router.post('/reconciliation/new', createTransaction);

//create transaction (mulitple)
router.post('/reconciliation/new-multiple', createMultipleTransactions);


//update (recon / move)
router.patch('/reconciliation/update/:id', updateTransaction)

export default router;