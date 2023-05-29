import express from "express";
export const TaskRouters = express.Router();
import auth from "../middleware/auth.js";
import * as taskController from "../controller/taskController.js";



//create task router
TaskRouters.post("/createtask",auth,taskController.createTask);

//get task router

TaskRouters.get("/gettask",auth,taskController.getTask);
