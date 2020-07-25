const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    todoName: { type: String, required: true },
    createdDate: { type: String, required: true },
    updatedDate: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" }
});

module.exports = mongoose.model("TodoList", todoSchema);