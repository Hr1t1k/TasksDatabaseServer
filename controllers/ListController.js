import expressAsyncHandler from "express-async-handler";
import List from "../models/ListModel.js";
import Task from "../models/TaskModel.js";
import ObjectID from "bson-objectid";
import {
  updateList,
  getAllLists,
  setAllLists,
  updateTask,
} from "../daos/impl/redis/site_dao_redis_impl.js";
const createList = expressAsyncHandler(async (req, res) => {
  try {
    const user = req.user.uid;

    const { listId, name } = req.body;
    const newList = await List.create({ _id: listId, name, creator: user });
    updateList(user);
    res.status(200).json({ _id: newList._id, name: newList.name });
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error.message);
  }
});

const deleteList = expressAsyncHandler(async (req, res) => {
  try {
    const user = req.user.uid;

    const { _id } = req.body;
    updateList(user);
    updateTask(_id);
    const deletedList = await List.findOneAndDelete({ _id, creator: user });
    if (deletedList == null)
      throw new Error("Invalid Permission/List not found.");
    res.status(200).json({ message: "List deleted successfully." });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const renameList = expressAsyncHandler(async (req, res) => {
  try {
    const user = req.user.uid;

    const { _id, name } = req.body;
    updateList(user);
    updateTask(_id);
    const updatedList = await List.findOneAndUpdate(
      { _id, creator: user },
      { name },
      { new: true }
    );
    if (updatedList == null) throw new Error("Unable to update list.");
    res.status(200).json({ message: "List updated successfully" });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const getLists = expressAsyncHandler(async (req, res) => {
  try {
    const user = req.user.uid;
    const result = await getAllLists(user);
    if (result) {
      res.status(200).json(result);
    } else {
      const lists = await List.find({ creator: user });
      if (lists.length == 0) {
        const id = ObjectID();
        const newList = await List.create({
          _id: id,
          name: "Main",
          default: true,
          creator: user,
        });
        lists.concat(newList);
        const listId = newList._id;
        const defaultTasks = [
          {
            content: "You can easily keep track your tasks here",
            parList: listId,
            _id: ObjectID(),
          },
          {
            content: "Try creating new tasks by clicking on + button below.",
            parList: listId,
            _id: ObjectID(),
          },
          {
            content:
              "You can also create different lists here to separate your tasks.",
            parList: listId,
            _id: ObjectID(),
          },
        ];
        await Task.insertMany(defaultTasks);
        setAllLists([newList]);
        res.status(200).json([newList]);
      } else {
        await setAllLists(user, lists);
        res.status(200).json(lists);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

export { createList, renameList, deleteList, getLists };
