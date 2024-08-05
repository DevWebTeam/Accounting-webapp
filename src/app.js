/* import bodyParser from "body-parser"; */
import express from "express";
import './configs/connects.js';
import clientsRoute from "./routes/client-management.js";
import currenciesRoute from "./routes/currencies-management.js";
import financesRoute from "./routes/financial-management.js";
import notificationsRoute from "./routes/notifications.js";

const app = express();
const port = 3000;

/* app.use(bodyParser.urlencoded({ extended: true })); */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));


app.use("/finances", financesRoute);
app.use("/clients", clientsRoute);
app.use("/currencies", currenciesRoute);
app.use("/notifications", notificationsRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
