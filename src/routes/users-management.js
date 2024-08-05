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

router.get("/user", getUserById);

router.post("/add", createUserById);

router.patch("/user/Update", updateUserById);

router.delete("/user/delete", deleteUserById);





export default router;