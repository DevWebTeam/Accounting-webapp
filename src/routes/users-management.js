import express from "express";
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    updateUserRoleById,
    deleteUserById
} from "../controllers/userControllers.js"

const router = express();


router.get("/", getAllUsers);

router.get("/user/:id", getUserById);

router.post("/add", createUser);

router.patch("/user/Update", updateUserById);

router.delete("/user/delete/:id", deleteUserById);





export default router;