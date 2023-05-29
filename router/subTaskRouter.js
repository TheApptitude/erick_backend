import express from "express";
export const subTaskRouters = express.Router();
import auth from "../middleware/auth.js";
import * as subTaskController from "../controller/subtaskController.js";


//create sub task router
subTaskRouters.post("/createsubtask",auth,subTaskController.createSubtask);

//get sub task router
subTaskRouters.get("/getsubtask",auth,subTaskController.getSubTask);
