require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http").Server(app);
var path = require("path");

//Routes
var indexRouter = require("./routes/index");
app.use("/", indexRouter);

//Static resources
app.use(express.static(path.join(__dirname, "public")));

//view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

module.exports = app;
