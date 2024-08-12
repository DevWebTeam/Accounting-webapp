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
import { checkIfBanned } from "../controllers/functions.js";



const router = express.Router();



router.get("/", );



//*budget
router.get("/General-budget", );



//*ledger
router.get("/ledger", );


//*journal
router.get("/journal", checkIfBanned() );




//* reconciliation
router.get("/reconciliation", checkIfBanned());






export default router;
