const mongoose = require("mongoose");

const todoListSchema = require("../model/schemas/todoList-schema");
const httpError = require("../model/http-error");
const User = require("../model/schemas/user-schema");
const { hydrate } = require("../model/schemas/user-schema");

const createTodoList = async (req, res, next) => {
    const { todoName, createdDate, updatedDate, isCompleted, creator } = req.body;
    const createTodos = new todoListSchema({ todoName, createdDate, updatedDate, isCompleted, creator });
    let checkUser;
    try {
        checkUser = await User.findById(creator);
    } catch (error) {
        error = new httpError("User not available while creating Todo", 500);
        return next(error);
    }
    if (!checkUser) return next(new httpError("Specified user not available while creating Todos", 404));
    let createdTodos;
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        createdTodos = await createTodos.save({ session: sess });
        await checkUser.todos.push(createdTodos);
        await checkUser.save({ session: sess });
        await sess.commitTransaction();
    } catch (error) {
        error = new httpError("Failed to create Todo List", 404);
        return next(error);
    }
    res.status(201).json(createdTodos);
}

const getTodoList = async (req, res, next) => {
    const result = await todoListSchema.find().exec();
    res.json(result);
}

const getTodoListById = async (req, res, next) => {
    const { todoId } = req.params;
    let result;
    try {
        result = await todoListSchema.findById(todoId).exec();
    } catch (error) {
        error = new httpError("Error occured while fetching TodoList data", 500);
        return next(error);
    }
    if (!result) return next(new httpError("No Todos found", 404))
    res.json({ result: result.toObject({ getters: true }) });
}

const getTodoListByUser = async (req, res, next) => {
    const { uid } = req.params;
    // let todoListDoc;
    let getWithUser;
    try {
        // todoListDoc = await todoListSchema.find({ creator: uid }, "todoName createdDate updateDate isCompleted");
        //Another Method
        getWithUser = await User.findById(uid).populate("todos");
        console.log(getWithUser)
    } catch (error) {
        return next(new httpError("Error occured while getting todos", 500));
    }
    // if (!todoListDoc || todoListDoc.length === 0) return next(new httpError("No todos available for the User", 404));
    if (!getWithUser.todos || getWithUser.todos.length === 0) return next(new httpError("No todos available for the User", 404));
    res.status(200).json({ todos: getWithUser.todos.map((itr) => itr.toObject({ getters: true })) });
}

const deleteTodoList = async (req, res, next) => {
    const { todoId } = req.params;
    let deleteTodo;
    // const { userId } = req.body;
    // let getUser;
    // try {
    //     getUser = await User.findById(userId);
    // } catch (error) {
    //     next(new httpError("Error occured while fetching user data", 500));
    // }
    // if (!getUser || getUser.todos.length === 0) return next(new httpError("User Data not available", 404));
    try {
        deleteTodo = await todoListSchema.findById(todoId).populate("creator");
    } catch (error) {
        return next(new httpError("Error occured while deleting", 500));
    }
    console.log(deleteTodo);
    if (!deleteTodo) return next(new httpError("Todo not found", 404));
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await deleteTodo.remove({ session: sess });
        await deleteTodo.creator.todos.pull(deleteTodo);
        await deleteTodo.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (error) {
        console.log(error);
        return next(new httpError("Erorr occured while deleting Todo", 500));
    }
    res.status(201).json({ message: "Deleted Successfully" });
}



exports.createTodoList = createTodoList;
exports.getTodoList = getTodoList;
exports.getTodoListById = getTodoListById;
exports.getTodoListByUser = getTodoListByUser;
exports.deleteTodoList = deleteTodoList;