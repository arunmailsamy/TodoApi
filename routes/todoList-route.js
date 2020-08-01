const express = require("express");

const todoListController = require("../controller/todoList-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.use(checkAuth);
router.post("/createTodos", todoListController.createTodoList);

//router.get("/getTodos", todoListController.getTodoList);

//router.get("/getTodos/:todoId", todoListController.getTodoListById);

//router.get("/getTodosByUser/:uid", todoListController.getTodoListByUser);

router.get("/getTodosByUid/:uid", todoListController.getTodoListByUid);

router.patch("/updateTodosByUid/:uid", todoListController.updateTodosByUid);

router.delete("/deleteAllTodos/:uid", todoListController.deleteAllTodos);

router.delete("/deleteOne/:uid", todoListController.deleteOne);
module.exports = router;