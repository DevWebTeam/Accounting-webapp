import express from "express";
import bodyParser from "body-parser";
import './src/configs/connect.js';
import session from "express-session";
import passport from "passport";
import env from "dotenv";
import initializePassport from "./src/configs/passport.js"
import { checkIfAuthorized } from "./src/controllers/functions.js";


//routes
import financesRoute from "./src/routes/financial-management.js";
import clientsRoute from "./src/routes/client-management.js";
import currenciesRoute from "./src/routes/currencies-management.js";
import usersRoute from "./src/routes/users-management.js";
import signupRoute from "./src/routes/login-signup.js"
import settingsRoute from "./src/routes/settings.js";
//models


env.config();

const app = express();
const port = process.env.PORT;



//middle-ware
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 1000 * 3600 * 24
  },
  resave: false,
  saveUninitialized: true
}))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());


//routes
app.use("/finances", financesRoute);
app.use("/clients", clientsRoute);
app.use("/currencies", currenciesRoute);
app.use("/users",checkIfAuthorized() , usersRoute);
app.use("/settings", settingsRoute);
app.use("/", signupRoute);


initializePassport(passport);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});