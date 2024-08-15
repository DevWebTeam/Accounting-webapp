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
import {checkIfAuthorized, checkIfBanned} from "../controllers/functions.js"


const router = express.Router();



router.get("/", getAllClients);

router.get("/client/:id",checkIfAuthorized(), getClientById);

router.post("/add",checkIfAuthorized(), createClient);

router.patch("/client/patch/:id",checkIfAuthorized(), updateClientById);

router.delete("/client/delete/:id",checkIfAuthorized(), deleteClientById);



//groups
router.get('/groups', getAllGroups);

router.post('/groups/add', checkIfAuthorized(), createGroup);

router.delete('/groups/delete/:id', checkIfAuthorized(), deleteGroupById);



export default router;