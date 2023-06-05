import express from "express";
import * as userController from "../controller/userController.js";
import auth from "../middleware/auth.js";
export const UserRouters = express.Router();

//user register routes
UserRouters.post("/userRegister", userController.userRegister);

//user login routes
UserRouters.post("/userLogin", userController.userLogin);

UserRouters.post("/forgetPassword", userController.forgetPassword);

UserRouters.post("/verifyOtp", userController.verifyOtp);

UserRouters.post("/resetPassword", auth, userController.resetPassword);

UserRouters.put("/updateImage",auth,userController.updateImage);