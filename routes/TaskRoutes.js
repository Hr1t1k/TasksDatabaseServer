import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  createTask,
  deleteTask,
  getTasksByListId,
} from "../controllers/TaskController.js";

const router = express.Router();
router.get("/", protect, getTasksByListId);
router.route("/").post(protect, createTask);

router.route("/").delete(protect, deleteTask);
// router.route("/").put(protect, renameList);

export default router;
