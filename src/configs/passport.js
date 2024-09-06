import { Strategy } from "passport-local";
import { checkHashedPassword } from "../controllers/functions.js";
import User from "../models/user.js";



export function initializePassport(passport) {
    passport.use(
        new Strategy(async function verify(username, password, cb) {
            try {
                const user = await User.findOne({username: username});
                const samePassword = await checkHashedPassword(password, user.password);

                if (samePassword) {
                    return cb(null, user);
                } else {
                    return cb("Incorrect password");
                }
                
            } catch (error) {
                console.error("Error:", error.message);
                return cb("User not registered");
            }
        })
    )





    passport.serializeUser((user, cb) => {
        cb(null, {userId: user._id, userName: user.username , userRole: user.role});
    });



    passport.deserializeUser( async (sessionData, cb) => {
        try {
            // Fetch user from the database based on the ID in session
            const user = await User.findById(sessionData.userId);
            if (user) {
                // Attach role to the user object
                user.role = sessionData.userRole;
                user.username = sessionData.userName;
                cb(null, user);
            } else {
                cb('User not found');
            }
        } catch (error) {
            cb(error);
        }
    })

}



export default initializePassport;
