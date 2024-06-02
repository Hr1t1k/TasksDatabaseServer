import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  createList,
  deleteList,
  getLists,
  renameList,
} from "../controllers/ListController.js";

const router = express.Router();

router.route("/").post(protect, createList);
router.route("/").get(protect, getLists);
router.route("/").delete(protect, deleteList);
router.route("/").put(protect, renameList);

export default router;
