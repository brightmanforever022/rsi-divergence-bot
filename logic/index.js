const express = require("express");
const routes = require("./routes");
const app = express();
const port = 8080;
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");




app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

routes(app);

const server = app.listen(port, () => {
    console.log("Listening...");
});

