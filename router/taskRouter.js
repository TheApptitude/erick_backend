import express from "express";
export const TaskRouters = express.Router();
import auth from "../middleware/auth.js";
import * as taskController from "../controller/taskController.js";



//create task router
TaskRouters.post("/createTask",auth,taskController.createTask);

//get task router

TaskRouters.get("/getTask",auth,taskController.getTask);

//get task by id router

TaskRouters.get("/getTaskById/:id",auth,taskController.getTaskById);

//update task

TaskRouters.put("/updateTask/:id",auth,taskController.updateTask);


//delete task

TaskRouters.delete("/deleteTask/:id",auth,taskController.deleteTask);