const jwt = require("jsonwebtoken");
require("dotenv").config();
const httpError = require("../model/http-error");
const { get } = require("mongoose");

module.exports = (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }
    try {
        const getToken = req.headers.authorization.split(" ")[1];   // Authorization : Bearer TOKEN
        if (!getToken) {
            throw new Error("Auth failed");
        }
        const verify = jwt.verify(getToken, process.env.PRIVATE_ACCESS_TOKEN);
        req.userData = { userId: verify.userId, email: verify.email };
        next();
    } catch (error) {
        return next(new httpError("Authentication Failed", 401));
    }
}