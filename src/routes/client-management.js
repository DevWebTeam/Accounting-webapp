import express from "express";
import {
    createClient,
    getAllClients,
    getClientById,
    updateClientById,
    deleteClientById,
    createGroup,
    getAllGroups,
    deleteGroupById
} from "../controllers/clientControllers.js"
import {checkIfAuthorized } from "../controllers/functions.js"


const router = express.Router();



router.get("/", getAllClients);

router.get("/client/:id", getClientById);

router.post("/add", createClient);

router.patch("/client/patch/:id", updateClientById);

router.delete("/client/delete/:id", checkIfAuthorized('admin', 'manager'), deleteClientById);



//groups
router.get('/groups', getAllGroups);

router.post('/groups/add', checkIfAuthorized('admin', 'manager'), createGroup);

router.delete('/groups/delete/:id', checkIfAuthorized('admin', 'manager'), deleteGroupById);



export default router;