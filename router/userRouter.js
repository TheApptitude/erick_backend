import express from "express";
import * as userController from "../controller/userController.js"

export const UserRouters = express.Router();


//user register routes
UserRouters.post("/userRegister", userController.userRegister);

//user login routes
UserRouters.post("/userLogin",userController.userLogin);

