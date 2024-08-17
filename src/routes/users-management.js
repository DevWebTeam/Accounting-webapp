import express from "express";
import {
    createUser,
    deleteUserById,
    getAllUsers,
    getUserById,
    updateUserById
} from "../controllers/userControllers.js";

const router = express();


router.get("/", getAllUsers);

router.get("/user", getUserById);

router.post("/add", createUser);

router.patch("/user/Update", updateUserById);

router.delete("/user/delete", deleteUserById);





export default router;