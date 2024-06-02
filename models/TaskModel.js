import mongoose from "mongoose";
const { Schema } = mongoose;

const taskSchema = new Schema({
  _id: {
    type: String,
    required: true,
    unique: true,
    background: false,
  },
  content: String,
  parList: { type: mongoose.Schema.Types.ObjectId, ref: "List", req: true },
});

const Task = mongoose.model("Task", taskSchema);
export default Task;
