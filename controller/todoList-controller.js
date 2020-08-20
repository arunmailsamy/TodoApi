const mongoose = require("mongoose");

const todoListSchema = require("../model/schemas/todoList-schema");
const httpError = require("../model/http-error");
const User = require("../model/schemas/user-schema");

const createTodoList = async (req, res, next) => {
  let { todos, creator } = req.body;
  let checkUser;
  let createTodos = new todoListSchema({ todos, creator });
  try {
    checkUser = await User.findById(creator);
  } catch (error) {
    error = new httpError("User not available while creating Todo", 500);
    return next(error);
  }

  if (!checkUser)
    return next(
      new httpError("Specified user not available while creating Todos", 404)
    );

  try {
    checkCreator = await todoListSchema.find({ creator });
    if (checkCreator.length !== 0) throw Error; // If todo is already available then throw error
  } catch (error) {
    error = new httpError("TodoList already exists for the user", 404);
    return next(error);
  }

  let createdTodos;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    //  createdTodos = await todoListSchema.insertMany(createTodos, { session: sess });
    //  await checkUser.todos.push({ $each: createdTodos });  // we can also pass position $position:0 to insert in specified position
    createdTodos = await createTodos.save({ session: sess });
    console.log(createdTodos);
    await checkUser.todos.push(createdTodos);
    await checkUser.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    console.log(error);
    error = new httpError("Failed to create Todo List", 404);
    return next(error);
  }
  res.status(201).json(createdTodos);
};

const updateTodosByUid = async (req, res, next) => {
  const { uid } = req.params;
  const { id, todoName, createdDate, updatedDate, isCompleted } = req.body;
  let checkUser;
  try {
    checkUser = await User.findById(uid);
  } catch (error) {
    error = new httpError("User not available while creating Todo", 500);
    return next(error);
  }

  if (!checkUser)
    return next(
      new httpError("Specified user not available while creating Todos", 404)
    );

  const updated = await todoListSchema.findOneAndUpdate(
    { creator: uid, todos: { $elemMatch: { _id: id } } },
    {
      $set: {
        "todos.$.isCompleted": isCompleted,
        "todos.$.todoName": todoName,
        "todos.$.createdDate": createdDate,
        "todos.$.updatedDate": updatedDate,
      },
    },
    { new: true, safe: true },
    (error) => {
      if (error)
        return next(new httpError("Error occured while updating Todo", 500));
    }
  );
  res.status(201).json({ result: "Updated successfully" });
};

const addTodosByUid = async (req, res, next) => {
  const { uid } = req.params;
  let checkUser;
  try {
    checkUser = await User.findById(uid);
  } catch (error) {
    error = new httpError("User not available while creating Todo", 500);
    return next(error);
  }
  if (!checkUser)
    return next(
      new httpError("Specified user not available while creating Todos", 404)
    );
  let addTodo;
  try {
    addTodo = await todoListSchema.findOneAndUpdate(
      { creator: uid },
      {
        $push: { todos: req.body },
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    error = new httpError("Error Occured while adding todos", 404);
    return next(error);
  }
  res.status(201).json({ result: addTodo.todos });
};

const getTodoList = async (req, res, next) => {
  const result = await todoListSchema.find().exec();
  res.json(result);
};

const getTodoListById = async (req, res, next) => {
  const { todoId } = req.params;
  let result;
  try {
    result = await todoListSchema.findById(todoId, "todos");
  } catch (error) {
    error = new httpError("Error occured while fetching TodoList data", 500);
    return next(error);
  }
  if (!result) return next(new httpError("No Todos found", 404));
  res.json({
    result: result.todos.map((itr) => itr.toObject({ getters: true })),
  });
};

//Another method to get Todos
const getTodoListByUser = async (req, res, next) => {
  const { uid } = req.params;
  // let todoListDoc;
  let getWithUser;
  try {
    // todoListDoc = await todoListSchema.find({ creator: uid }, "todoName createdDate updateDate isCompleted");
    //Another Method
    getWithUser = await User.findById(uid).populate("todos");
    console.log(getWithUser.todos);
  } catch (error) {
    return next(new httpError("Error occured while getting todos", 500));
  }
  if (!getWithUser.todos || getWithUser.todos.length === 0)
    return next(new httpError("No todos available for the User", 404));
  res.status(200).json({
    result: getWithUser.todos[0].todos.map((itr) =>
      itr.toObject({ getters: true })
    ),
  });
};

const getTodoListByUid = async (req, res, next) => {
  const { uid } = req.params;
  let getData;
  try {
    getData = await User.findOne({ _id: uid }).populate("todos");
    console.log(getData);
  } catch (error) {
    console.log(error);
    return next(new httpError("Error occured while fecthing Todo data", 404));
  }
  if (!getData.todos[0])
    return res.status(200).json({ message: "No Todos Found" });
  res.status(200).json({ Todos: getData.todos[0].todos });
};

const deleteAllTodos = async (req, res, next) => {
  const { uid } = req.params;
  let deleteTodo;
  // let getUser;
  // try {
  //     getUser = await User.findById(userId);
  // } catch (error) {
  //     next(new httpError("Error occured while fetching user data", 500));
  // }
  // if (!getUser || getUser.todos.length === 0) return next(new httpError("User Data not available", 404));
  try {
    deleteTodo = await todoListSchema
      .findOne({ creator: uid })
      .populate("creator");
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
};

const deleteOne = async (req, res, next) => {
  const { uid } = req.params;
  const { todoId } = req.body;
  try {
    // const getit = await todoListSchema.findOne({ "creator": uid })
    // const deleteit = getit.todos.find((element) => element.id === todoId);
    const deleted = await todoListSchema.updateOne(
      { creator: uid },
      {
        $pull: {
          todos: { _id: todoId },
        },
      },
      { safe: true },
      (error, deletedObj) => {
        if (error) {
          console.log(error);
          return next(new httpError("Error occured while deleting Todo", 500));
        }
        if (deletedObj.nmodified)
          return res.status(201).json({ message: "Deleted Successfully" });
        else
          return res.status(404).json({ message: "Todo not found to delete" });
      }
    );
    // console.log(deleted)
    //  res.status(201).json({ result: deleted });
  } catch (error) {
    console.log(error);
    return next(new httpError("Error Occured while deleting", 404));
  }
};

exports.createTodoList = createTodoList;
exports.getTodoList = getTodoList;
exports.getTodoListById = getTodoListById;
exports.getTodoListByUser = getTodoListByUser;
exports.deleteAllTodos = deleteAllTodos;
exports.getTodoListByUid = getTodoListByUid;
exports.updateTodosByUid = updateTodosByUid;
exports.deleteOne = deleteOne;
exports.addTodosByUid = addTodosByUid;
