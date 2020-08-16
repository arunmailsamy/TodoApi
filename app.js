const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const userRoute = require("./routes/user-route");
const todoRoute = require("./routes/todoList-route");
const httpError = require("./model/http-error");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    next();
})

app.use("/api", userRoute);

app.use("/todoapi", todoRoute);

mongoose.connect("mongodb+srv://arun:6fJNuO5PfGNV9t7Y@cluster0.esywl.gcp.mongodb.net/TodoList?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("Connected to DB");
        app.listen(process.env.PORT || 5000);
    }).catch((error) => {
        console.log(error)
        console.log("Error in connecting DB")
    });
app.use((req, res, next) => {
    return next(new httpError("couldn't find the route", 404));
})
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500).json({ message: error.message || "unknown error occured" })
})