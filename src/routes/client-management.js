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

router.patch("/client/update/:id", updateClientById);

router.delete("/client/delete/:id", deleteClientById);




export default router;