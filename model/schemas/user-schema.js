const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;
const userSchema = Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 4 },
    todos: [{ type: Schema.Types.ObjectId, required: true, ref: "TodoList" }]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema); 