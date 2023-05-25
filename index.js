import express from "express";
import bodyParser from "body-parser";
import dbConnect  from "./connectivity.js";
import path from "path";


import { UserRouters } from "./router/userRouter.js";
const app=express();

const api_prifix=process.env.API_PRIFEX;
const port=process.env.PORT||4000;



app.use("/public/uploads", express.static(path.join("public", "uploads")));


app.use(bodyParser.json());
// Configure bodyparser to handle post requests
app.use(bodyParser.urlencoded({ extended: true }));


app.use(api_prifix,UserRouters);

dbConnect();




app.listen(port,()=>{
    console.log(`server is running at ${port}`);
})