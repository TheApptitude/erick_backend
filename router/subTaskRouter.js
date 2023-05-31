import express from "express";
export const subTaskRouters = express.Router();
import auth from "../middleware/auth.js";
import * as subTaskController from "../controller/subtaskController.js";


//create sub task router
subTaskRouters.post("/createSubTask",auth,subTaskController.createSubtask);

//get sub task router
subTaskRouters.get("/getSubTask",auth,subTaskController.getSubTask);


//get sub task by id router
subTaskRouters.get("/getSubTask/:id",auth,subTaskController.getSubTaskById);

//update sub task router
subTaskRouters.put("/updateSubTask/:id",auth,subTaskController.updateSubTask);

//delete sub task router
subTaskRouters.delete("/deleteSubTask/:id",auth,subTaskController.deleteSubTask);