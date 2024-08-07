import express from "express";
import {
    createClient,
    deleteClientById,
    getAllClients,
    getClientById,
    getClientByName,
    updateClientById
} from "../controllers/clientControllers.js";


const router = express.Router();



router.get("/", getAllClients);

router.get("/client", getClientById);

router.post("/add", createClient);

router.patch("/client/update", updateClientById);

router.get('/name/:name',getClientByName);

router.delete("/client/delete", deleteClientById);




export default router;