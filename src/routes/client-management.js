import express from "express";
import {
    createClient,
    getAllClients,
    getClientById,
    updateClientById,
    deleteClientById
} from "../controllers/clientControllers.js"


const router = express.Router();



router.get("/", getAllClients);

router.get("/client", getClientById);

router.post("/add", createClient);

router.patch("/client/update", updateClientById);

router.delete("/client/delete", deleteClientById);




export default router;