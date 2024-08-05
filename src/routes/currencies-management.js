import express from "express";
import {
    createCurrency,
    getAllCurrencies,
    getCurrencyById,
    updateCurrencyById,
    patchCurrency,
    deleteCurrencyById
} from "../controllers/currencyControllers.js";


const router = express.Router();




router.get("/", getAllCurrencies);

router.post("/add", createCurrency);

router.get("/currency", getCurrencyById);

router.patch("/currency/update", updateCurrencyById);

router.patch("/currency/patch", patchCurrency);

router.delete("/currency/delete", deleteCurrencyById);



export default router;