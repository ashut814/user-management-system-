const http = require("http");
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyparser = require("body-parser");
const path = require("path");
const connectDb = require("./server/database/connection");
const config = require("./config");
const session = require("express-session");

dotenv.config({ path: "config.env" });
const PORT = process.env.PORT || 8080;

// session middleware
app.use(
  session({
    secret: "mysecretkey",
  })
);

// log request
app.use(morgan("dev"));

//mongodb connection
connectDb();

// parse request to body-parser
app.use(bodyparser.urlencoded({ extended: true }));

// set view engine
app.set("view engine", "ejs");
// app.set('views', path.resolve(__dirname, 'views/ejs'));

// load assets
app.use("/css", express.static(path.resolve(__dirname, "assets/css")));
app.use("/img", express.static(path.resolve(__dirname, "assets/img")));
app.use(
  "/javascript",
  express.static(path.resolve(__dirname, "assets/javascript"))
);

// load routers users
app.use("/", require("./server/routes/router"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// for admin
const adminRoute = require('./server/routes/adminRoute');
app.use('/admin', adminRoute);

app.listen(3000, () => {
  console.log(`server is running on local host ${PORT}:`);
});
