import express from "express";
export const subTaskRouters = express.Router();
import auth from "../middleware/auth.js";
import * as subTaskController from "../controller/subtaskController.js";


//create sub task router
subTaskRouters.post("/createSubTask",auth,subTaskController.createSubtask);

//get sub task router
subTaskRouters.get("/getSubTask",auth,subTaskController.getSubTask);
