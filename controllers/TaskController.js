import expressAsyncHandler from "express-async-handler";
import Task from "../models/TaskModel.js";
import List from "../models/ListModel.js";
import {
  getTasks,
  setTasks,
  updateTask,
} from "../daos/impl/redis/site_dao_redis_impl.js";
// const Task = expressAsyncHandler(async (req, res) => {
//   try {
//   } catch (error) {
//     res.status(400).send(error.message);
//   }
// });

const createTask = expressAsyncHandler(async (req, res) => {
  try {
    const user = req.user.uid;
    const { listId, content, taskId } = req.body;
    const list = await List.findOne({ _id: listId, creator: user });
    if (list == null)
      throw new Error("Invalid permissions/Failed to create task.");
    const newTask = Task.create({ _id: taskId, content, parList: listId });
    updateTask(listId);
    res.status(200).json(newTask);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const deleteTask = expressAsyncHandler(async (req, res) => {
  try {
    const user = req.user.uid;
    const { _id } = req.body;
    const task = await Task.findById(_id);
    if (task == null) throw new Error("Invalid task id.");

    const list = await List.findOne({ _id: task.parList, creator: user });
    if (list == null)
      throw new Error("Invalid permissions/Failed to create task.");
    const deletedTask = await Task.findByIdAndDelete(_id);
    console.log(deletedTask);
    if (deletedTask == null)
      throw new Error("Unable to delete. Try again later");
    updateTask(list._id);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const getTasksByListId = expressAsyncHandler(async (req, res) => {
  try {
    const user = req.user.uid;
    const { _id } = req.query;
    const result = await getTasks(_id);
    if (result) {
      res.status(200).json(result);
    } else {
      const list = await List.findOne({ _id, creator: user });
      if (list == null)
        throw new Error("Invalid permissions/Failed to create task.");
      const tasks = await Task.find({ parList: _id });
      setTasks(_id, [tasks, list]);
      res.status(200).json([tasks, list]);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

export { createTask, deleteTask, getTasksByListId };
