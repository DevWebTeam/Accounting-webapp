import express from "express";
import {
    createCurrency,
    deleteCurrencyById,
    getAllCurrencies,
    getCurrencyById,
    getCurrencyByName,
    updateCurrencyById
} from "../controllers/currencyControllers.js";


const router = express.Router();




router.get("/", getAllCurrencies);

router.post("/add", createCurrency);

router.get("/currency", getCurrencyById);

router.patch("/currency/update", updateCurrencyById);

router.get('/name/:name', getCurrencyByName);

router.delete("/currency/delete", deleteCurrencyById);



export default router;