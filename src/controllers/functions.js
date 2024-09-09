import bcrypt from "bcrypt";
import User from "../models/user.js"

export async function hashPassword (password, saltRounds = 10) {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}



export async function checkHashedPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}



export function checkIfAuthorized(role = ['admin']) {
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            const userRole = req.user.role
            console.log("user role:", userRole);
            if (role.includes(userRole)) {
                return next()
            } else {
                return res.status(403).send("..ليس لديك صلاحية كافية")
            }

        } else {
            return res.redirect("/login");
        }
    }
}



export function checkIfBanned () {
    return async (req, res, next) => {
        
        // const user = await User.findOne({username: req.session.passport.user.userName});
        if (!false) {
            next();
        } else {
            res.status(401).send("لقد تم حظرك من قبل الإدارة العامة")
        }
    }
}



export default {
    hashPassword,
    checkHashedPassword,
    checkIfAuthorized,
    checkIfBanned
}