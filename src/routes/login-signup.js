import express from "express";
import bodyParser from "body-parser";
import passport from "passport";

import { signup, logout} from "../controllers/login-signupContollers.js";

const router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));
router.use(express.json());


//*signup
router.get('/signup', (req, res) => {
    res.status(200).render("signup.ejs")
})


router.post('/signup', signup);




//*login
router.get('/login', (req, res) => {
    res.status(200).render("login.ejs");
});


router.post('/login', (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/currencies",
        failureRedirect: "/login",
    }) (req, res, next)
});




//*logout
router.get("/logout", logout);


export default router;