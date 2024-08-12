import User from '../models/user.js';
import {hashPassword} from "../controllers/functions.js"




// Create a new user
export const createUser = async (req, res) => {
    try {

        if (req.isAuthenticated()) {
            const hash = await hashPassword(req.body.password)
    
            const newUser = {
                username: req.body.username,
                number: req.body.number,
                email: req.body.email,
                password: hash,
                role: req.body.role
            };
    
            console.log(newUser);
    
            const user = new User(newUser);
            await user.save();
            res.status(201).redirect('/settings/users');

        } else {
            res.redirect("/login")
        }

    } catch (error) {
        console.log("Error:", error.message);
        res.status(400).send("Error: Something went wrong");
    }
};


// Get all users
export const getAllUsers = async (req, res) => {
    try {

        if (req.isAuthenticated()) {
            console.log(req.body);
            const users = await User.find();
            // res.status(200).render("settings.ejs", {users: users})
            res.json(users);
        } else {
            res.redirect("/login")
        }

    } catch (error) {
        console.log("Error:", error.message);
        res.status(500).send("Error: something went wrong");
    }
};


// Get a user by ID
export const getUserById = async (req, res) => {
    try {

        if (req.isAuthenticated()) {
            const user = await User.findById(req.params.id);
            res.status(200).json(user);

        } else {
            res.redirect("/login")
        }

    } catch (error) {
        console.log("Error:", error.message);
        res.status(500).send("Error: something went wrong");
    }
};


// Update a user by ID
export const updateUserById = async (req, res) => {
    try {

        if (req.isAuthenticated()) {
            const updatedUser = {
                username: req.body.username,
                number: req.body.number,
                email: req.body.email,
                password: await hashPassword(req.body.password),
                role: req.body.role
            };
    
            const user = await User.findByIdAndUpdate(req.params.id, updatedUser, { new: true, runValidators: true });
            res.status(200).redirect("/settings/users");
        } else {
            res.redirect("/login")
        }

    } catch (error) {
        console.log("Error:", error.message);
        res.status(400).send("Error: An error has accured while updating user.");
    }
};


// Delete a user by ID
export const deleteUserById = async (req, res) => {
    try {

        if (req.isAuthenticated()) {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).redirect("/settings/users");
        } else {
            res.redirect("/login")
        }

    } catch (error) {
        console.log("Error:", error.message);
        res.status(500).send("Error: An error has accured while deleting user");
    }
};







export default {
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
};