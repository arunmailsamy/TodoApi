const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todoSchema = Schema({
  todoName: { type: String, required: true },
  createdDate: { type: String, required: true },
  updatedDate: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
});

const parentSchema = Schema({
  todos: { type: [todoSchema], required: true },
  creator: { type: Schema.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("TodoList", parentSchema);
