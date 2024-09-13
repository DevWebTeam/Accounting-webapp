import User from '../models/user.js';
import {hashPassword} from "../controllers/functions.js"




// Create a new user
export const createUser = async (req, res) => {
    try {

        if (req.isAuthenticated()) {

            console.log(req.body.password);
            console.log(req.body.password2);

            if (req.body.password === req.body.password2) {

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

                res.status(201).redirect('/users');
            } else {
                res.send('passwords must match');
            }


        } else {
            res.redirect("/login")
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(500).send(error.message)
    }
};


// Get all users
export const getAllUsers = async (req, res) => {
    try {

        if (req.isAuthenticated()) {
            console.log(req.body);
            const users = await User.find();

            res.render('users-management.ejs', {users: users, userName: req.session.passport.user.userName});
        } else {
            res.redirect("/login")
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(500).send(error.message)
    }
};

// Get a user by ID
export const getUserById = async (req, res) => {
    try {

        if (req.isAuthenticated()) {
            console.log(req.params);

            const user = await User.findById(req.params.id);
            console.log(user);
            
            res.status(200).json(user);
        } else {
            res.redirect("/login")
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(500).send(error.message)
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
                    role: req.body.role
                }
    
            const user = await User.findByIdAndUpdate(req.params.id, updatedUser, { new: true, runValidators: true });
            req.session.passport.user.userName = updatedUser.username;
            res.status(200).json(user);
        } else {
            res.redirect("/login")
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(500).send(error.message)
    }
};


// Delete a user by ID
export const deleteUserById = async (req, res) => {
    try {

        if (req.isAuthenticated()) {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json('deleted');
        } else {
            res.redirect("/login")
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(500).send(error.message)
    }
};


export const banUserById = async (req, res) => {
    try {

        if (req.isAuthenticated()) {
            let message = ''
            let user = await User.findById(req.params.id);
            if (user.banned) {
                user.banned = false;
                message = `تم رفع حظر المستخدم ${user.username}`
            }
            else {
                user.banned = true;
                message = `تم حظر المستخدم ${user.username}`
            }

            user.save();

            user = await User.findById(req.params.id);

            res.json({alertMessage: message})
        } else {
            res.redirect('/login');
        }


    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
}


export const updateUserPassword = async (req, res) => {
    if (req.isAuthenticated()) {
        if (req.body.password === req.body.password2) {
            try {
                const hash = await hashPassword(req.body.password, 10);
                let user = await User.findById(req.params.id);
                user.password = hash;
                await user.save();
                res.json({alertMessage: ` تم تغيير كلمة مرور المستخدم  ${user.username} بنجاح`})
            } catch (error) {
                console.log(error);
                res.send(error.message);
            }
        } else {
            res.send({alertMessage: 'يجب أن تتطابق كلمات المرور'});
        }
    } else {
        res.redirect('/login');
    }
}


export default {
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    banUserById,
    updateUserPassword
};