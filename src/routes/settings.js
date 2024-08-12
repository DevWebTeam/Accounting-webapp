import express from "express";
import {logout} from "../controllers/login-signupContollers.js"


const router = express.Router();


router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).render("settings.ejs");
    } else {
        res.redirect("/login");
    }
});

router.get('/logout', logout);






export default router;