import express from "express";
import User from "../models/user.js"


const router = express.Router();


router.get('/',  async (req, res) => {
    if (req.isAuthenticated()) {
        const myUsername = req.session.passport.user.userName;
        const myAccount = await User.findOne({username: myUsername});
        res.status(200).render("settings.ejs", {account: myAccount});
    } else {
        res.redirect("/login");
    }
});







export default router;