import express from "express";
import bodyParser from "body-parser";
import './src/configs/connect.js';
import session from "express-session";
import passport from "passport";
import env from "dotenv";
// for db backup 
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// end 
import initializePassport from "./src/configs/passport.js"
import { checkIfAuthorized, checkIfBanned } from "./src/controllers/functions.js";


//routes
import financesRoute from "./src/routes/financial-management.js";
import clientsRoute from "./src/routes/client-management.js";
import currenciesRoute from "./src/routes/currencies-management.js";
import usersRoute from "./src/routes/users-management.js";
import signupRoute from "./src/routes/login-signup.js"
import settingsRoute from "./src/routes/settings.js";
import notificationsRoute from "./src/routes/notifications-management.js"



env.config();

const app = express();
const port = process.env.PORT;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use("/finances", checkIfBanned(), financesRoute);
app.use("/clients", checkIfBanned(), clientsRoute);
app.use("/currencies", checkIfBanned() , currenciesRoute);
app.use("/users", checkIfAuthorized('admin'), checkIfBanned() , usersRoute);
app.use("/settings", checkIfBanned(), settingsRoute);
app.use("/", signupRoute);
app.use("/notifications", checkIfBanned(), notificationsRoute);


// Backup database route
app.get('/backup', (req, res) => {
  // Path to store the backup
  const backupPath = path.join(__dirname, 'backup');
  const fileName = `backup_${new Date().toISOString().split('T')[0]}.gz`;
  const fullPath = path.join(backupPath, fileName);

  // Create the backup folder if not exists
  if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath);
  }

  // Run the mongodump command to create the backup
  const command = `mongodump --uri="${process.env.MONGO_URL}" --archive=${fullPath} --gzip`;
  
  exec(command, (error, stdout, stderr) => {
      if (error) {
          console.error(`Backup error: ${error}`);
          return res.status(500).send('Error creating backup');
      }
      console.log('Backup completed:', stdout);

      // Provide the backup file for download
      res.download(fullPath, fileName, (err) => {
          if (err) {
              console.error(`Download error: ${err}`);
              res.status(500).send('Error downloading backup');
          }
      });
  });
});

initializePassport(passport);


app.listen(port || 3000,'0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});