const express = require("express");

const userController = require("../controller/user-controller");

const router = express.Router();

router.post("/signup", userController.signup);

router.post("/login", userController.login);

router.get("/getUsers", userController.getUsers);

module.exports = router;