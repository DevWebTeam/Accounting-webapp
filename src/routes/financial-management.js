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
    getLedger
} from '../controllers/transactionControllers.js';

const router = express.Router();


router.get('/hisab', (req, res) => {
    res.render('financial-management/account-statment.ejs');
})

router.get('/general-budget', getGeneralBudget);

router.get('/ledger', getLedger);

router.get("/journal", getJournal);

router.get("/reconciliation", getReconciliation);
    
router.get('/', getFinances);






//create transaction
router.post('/reconciliation/new', createTransaction);


//grouped by currency
//ledger client search
router.get('/by-client-gr-currency/:clientName', getTransactionsByClientGroupedByCurrency);



// Route to get transactions by client name
//ledger client currency search
router.get('/by-client/:clientName', getTransactionsByClient);




router.put('/update/:id', updateTransaction);

// Route to get a transaction by its ID
router.get('/get/:id', getTransactionById);


// Route to get transactions by currency name
router.get('/by-currency/:currencyNameInArabic', getTransactionsByCurrency);

// Route to delete a transaction by its ID
router.delete('/delete/:id', deleteTransactionById);



//archive
router.patch('/update/:id/archive', archiveTransaction);

//unarchive
router.patch('/update/:id/unarchive', unarchiveTransaction);

// Get transactions based on client names and currency names
router.post('/transactions-by-names', getTransactionsByNames);

// Get transactions based on client names and currency names and date
router.post('/transactions-by-names-and-date', getTransactionsByNamesAndDate);




export default router;