import express from "express";
import {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    updateTransactionById,
    archiveTransactionById,
    unarchiveTransactionById,
    deleteTransactionById
} from "../controllers/transactionControllers.js"



const router = express.Router();



router.get("/", );



//*budget
router.get("/General-budget", );



//*ledger
router.get("/ledger", );


//*journal
router.get("/journal", );




//* reconciliation
router.get("/reconciliation", );






export default router;
