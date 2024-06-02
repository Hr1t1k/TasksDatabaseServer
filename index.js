import express from "express";
import cors from "cors";
import connectDB from "./config/dbConfig.js";
import dotenv from "dotenv";
import taskRoutes from "./routes/TaskRoutes.js";
import listRoutes from "./routes/ListRoutes.js";
import { onRequest } from "firebase-functions/v2/https";
import functions from "firebase-functions/v1";
import axios from "axios";
import admin from "./config/firebaseConfig.js";
import { getAuth } from "firebase-admin/auth";
const app = express();

app.use(cors());
app.use(express.json());

dotenv.config();
connectDB();
app.use("/api/task", taskRoutes);
app.use("/api/list", listRoutes);

app.get("/", (req, res) => {
  res.status(200).send("server running");
});
// { cors: ["https://adch-group-5.vercel.app", "http://localhost:3000/"] }
const db = onRequest({ cors: true }, app);

// exports.api = functions.https.onRequest(app);

app.listen(3004, () => {
  console.log(`Listening on http://localhost:${"3004"}`);
});
