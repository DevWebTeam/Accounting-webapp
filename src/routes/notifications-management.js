import express from "express";
import bodyParser from "body-parser";

import { getAllNotifications } from "../controllers/notificationsControllers.js";
import {checkIfBanned} from "../controllers/functions.js";

const router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));
router.use(express.json());


router.get('/', checkIfBanned(), getAllNotifications);







export default router;