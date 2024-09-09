import express from "express";
import {
    createCurrency,
    getAllCurrencies,
    getCurrencyById,
    patchCurrencyById,
    deleteCurrencyById,
    getAllCurrenciesAsJson
} from "../controllers/currencyControllers.js";
import { checkIfAuthorized } from "../controllers/functions.js";


const router = express.Router();


router.get("/", getAllCurrencies);
router.post("/add",checkIfAuthorized('admin', 'manager') ,createCurrency);
router.get("/currency/:id", checkIfAuthorized('admin','manager') , getCurrencyById);
router.patch("/currency/patch/:id", checkIfAuthorized('admin', 'manager') , patchCurrencyById);
router.delete("/currency/delete/:id",checkIfAuthorized('admin', 'manager'),  deleteCurrencyById);
router.get("/exchRates", getAllCurrenciesAsJson);

export default router;