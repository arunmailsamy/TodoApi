const express = require("express");

const todoListController = require("../controller/todoList-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.use(checkAuth);
router.post("/createTodos", todoListController.createTodoList);

router.get("/getTodos", todoListController.getTodoList);

router.get("/getTodos/:todoId", todoListController.getTodoListById);

router.get("/getTodosByUser/:uid", todoListController.getTodoListByUser);

router.delete("/deleteTodo/:todoId", todoListController.deleteTodoList);

module.exports = router;