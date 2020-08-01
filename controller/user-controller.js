const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const userSchema = require("../model/schemas/user-schema");
const HttpError = require("../model/http-error");

const signup = async (req, res, next) => {
    const { username, email, password } = req.body;
    let checkExistingUser;
    try {
        checkExistingUser = await userSchema.findOne({ email: email });
    } catch (error) {
        return next(new HttpError("SignUp Failed! Please try again", 500));
    }
    if (checkExistingUser) return next(new HttpError("User already exists", 422));
    let createdUser;
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (error) {
        return next(new HttpError("SignUp Failed! Please try again", 500));
    }
    try {
        const createUser = new userSchema({ username, email, password: hashedPassword, todos: [] });
        createdUser = await createUser.save();
        console.log(createdUser)
    } catch (error) {
        return new HttpError("SignUp Failed! Please try again", 500);
    }
    let token;
    try {
        console.log(process.env.PRIVATE_ACCESS_TOKEN);
        token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, process.env.PRIVATE_ACCESS_TOKEN, { expiresIn: "1h" })
    } catch (error) {
        return new HttpError("SignUp Failed! Please try again", 500);
    }
    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
}

const login = async (req, res, next) => {
    const { email, password } = req.body;
    let checkExistingUser;
    try {
        checkExistingUser = await userSchema.findOne({ email: email });
        console.log(checkExistingUser);
    } catch (error) {
        return next(new HttpError("Login Failed! Please try again", 500));
    }
    if (!checkExistingUser) {
        return next(new HttpError("Username does not exists", 401));
    }
    let checkPassword;
    try {
        checkPassword = await bcrypt.compare(password, checkExistingUser.password);
    } catch (error) {
        return next(new HttpError("Login Failed! Please try again", 500));
    }
    if (!checkPassword) {
        return next(new HttpError("Invalid Credentials.Please enter correct credential", 401));
    }
    let token;
    try {
        token = jwt.sign({ userId: checkExistingUser.id, email: checkExistingUser.email }, process.env.PRIVATE_ACCESS_TOKEN, { expiresIn: "1h" })
        console.log(token);
    } catch (error) {
        return next(new HttpError("Login Failed! Please try again", 500));
    }

    res.status(200).json({ userId: checkExistingUser.id, email: checkExistingUser.email, token });
}

const getUsers = async (req, res, next) => {
    let allUsers;
    try {
        allUsers = await userSchema.find({}, "-password"); // or pass email username as 2nd arg to return that
    } catch (error) {
        return next(new HttpError("Error occured while parsing user details", 500));
    }
    if (!allUsers || allUsers.length === 0) return next(new HttpError("No Users Found", 500));
    res.json({ allUsers: allUsers.map((itr) => itr.toObject({ getters: true })) });
}

exports.signup = signup;
exports.login = login;
exports.getUsers = getUsers;