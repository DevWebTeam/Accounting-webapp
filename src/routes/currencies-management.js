import express from "express";
import {
    createCurrency,
    getAllCurrencies,
    getCurrencyById,
    patchCurrencyById,
    deleteCurrencyById
} from "../controllers/currencyControllers.js";


const router = express.Router();

router.get("/", getAllCurrencies);

router.post("/add", createCurrency);

router.get("/currency/:id", getCurrencyById);

router.patch("/currency/patch/:id", patchCurrencyById);

router.delete("/currency/delete/:id", deleteCurrencyById);



export default router;