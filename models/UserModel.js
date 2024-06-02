import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  _id: { type: String, required: true, unique: true, background: false },
  email: { type: String, required: true, unique: true, background: false },
  lists: [listSchema],
});

const User = mongoose.model("User", userSchema);
export default User;
