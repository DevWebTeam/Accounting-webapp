import express from "express";
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    banUserById,
    updateUserPassword
} from "../controllers/userControllers.js"
import { checkIfAuthorized } from "../controllers/functions.js";


const router = express.Router();


router.get("/", checkIfAuthorized() , getAllUsers);

router.get("/user/:id", checkIfAuthorized(), getUserById);

router.post("/add", checkIfAuthorized() , createUser);

router.patch("/user/update/:id", checkIfAuthorized(), updateUserById);

router.patch("/user/ban/:id", checkIfAuthorized() , banUserById);

router.patch("/user/password/:id", checkIfAuthorized(), updateUserPassword);

router.delete("/user/delete/:id", checkIfAuthorized() ,deleteUserById);



export default router;