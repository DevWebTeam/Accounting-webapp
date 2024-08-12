import express from "express";
import {
    createCurrency,
    getAllCurrencies,
    getCurrencyById,
    patchCurrencyById,
    deleteCurrencyById
} from "../controllers/currencyControllers.js";
import { checkIfAuthorized } from "../controllers/functions.js";


const router = express.Router();


router.get("/", getAllCurrencies);
router.post("/add",checkIfAuthorized() ,createCurrency);
router.get("/currency/:id", checkIfAuthorized() , getCurrencyById);
router.patch("/currency/patch/:id", checkIfAuthorized() , patchCurrencyById);
router.delete("/currency/delete/:id",checkIfAuthorized(),  deleteCurrencyById);


export default router;