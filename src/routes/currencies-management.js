import express from "express";
import {
    createCurrency,
    deleteCurrencyById,
    getAllCurrencies,
    getCurrencyById,
    getCurrencyByName,
    mappingCurrency,
    updateCurrencyById
} from "../controllers/currencyControllers.js";


const router = express.Router();




router.get("/", getAllCurrencies);

router.get("/map",mappingCurrency)

router.post("/add", createCurrency);

router.get("/currency/:id", getCurrencyById);

router.patch("/currency/update/:id", updateCurrencyById);

router.get('/name/:name', getCurrencyByName);

router.delete("/currency/delete/:id", deleteCurrencyById);



export default router;