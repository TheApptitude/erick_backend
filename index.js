import express from "express";
import bodyParser from "body-parser";
import dbConnect  from "./connectivity.js";
import path from "path";



import { UserRouters } from "./router/userRouter.js";
import { TaskRouters } from "./router/taskRouter.js";
import { subTaskRouters } from "./router/subTaskRouter.js";


const app=express();

const api_prifix=process.env.API_PRIFEX;
const port=process.env.PORT||4000;



app.use("/public/uploads", express.static(path.join("public", "uploads")));


app.use(bodyParser.json());
// Configure bodyparser to handle post requests
app.use(bodyParser.urlencoded({ extended: true }));



//user router
app.use(api_prifix,UserRouters);

// task router

app.use(api_prifix,TaskRouters);

//sub task router

app.use(api_prifix,subTaskRouters);


dbConnect();




app.listen(port,()=>{
    console.log(`server is running at ${port}`);
})