import { hashPassword} from "./functions.js";
import bodyParser from 'body-parser';
import express from "express";
import User from "../models/user.js"

const controller = express();

controller.use(bodyParser.urlencoded({extended: true}));
controller.use(express.json());

export const signup = async (req, res) => {
    if (req.body.password === req.body.password2) {
        try {
            const hash = await hashPassword(req.body.password);
            const newUser = {
                username: req.body.username,
                number: req.body.number,
                email: req.body.email,
                password: hash,
                role: "admin"
            };

            const user = new User(newUser);
            await user.save();

            console.log(newUser);

            req.login(user, (err) => {
                if (err) {
                    console.error("Login error:", err.message);
                    return res.status(500).send("An error occurred during login.");
                } else {
                    console.log("success");
                    res.redirect("/currencies");
                }
            });

        } catch (error) {
            if (error.code === 11000) {
                console.log("User already exists error:", error.message);
                res.send("User already exists");
            } else {
                console.log("Error occurred:", error.message);
                res.status(500).send("An error occurred");
            }
        }

    } else {
        res.send("Passwords must match");
    }
};



export const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/login");
    });
};



export default {signup, logout};

