import mongoose from "mongoose";
import Task from "../models/TaskModel.js";
const { Schema } = mongoose;

const listSchema = new Schema({
  name: { type: "String", required: true, trim: true },
  creator: { type: "String", required: true },
  default: { type: Boolean, required: true, default: false },
});

listSchema.pre("findOneAndDelete", async function (next) {
  try {
    await Task.deleteMany({ parList: this.getQuery()._id });
    next();
  } catch (error) {
    next(error);
  }
});
const List = mongoose.model("List", listSchema);

export default List;
