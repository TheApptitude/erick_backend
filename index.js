import express from "express";
import bodyParser from "body-parser";
import dbConnect  from "./connectivity.js";
import path from "path";
import swaggerAutogen from "swagger-autogen";


import { UserRouters } from "./router/userRouter.js";
import { TaskRouters } from "./router/taskRouter.js";
import { subTaskRouters } from "./router/subTaskRouter.js";

// Import the Swagger documentation middleware


// Call the Swagger middleware passing your Express app instance

const doc = {
    info: {
      title: 'Your API',
      description: 'API documentation for your Node.js application',
      version: '1.0.0',
    },
    host: 'localhost:4000',
    basePath: '/',
    schemes: ['http'],
  };
// Swagger definition
const outputFile = './swagger_output.json';
const endpointsFiles = ['./index.js']; // Specify the file(s) where your route handlers are defined



const app=express();
swaggerAutogen(outputFile, endpointsFiles, doc);

const apiPrefix=process.env.API_PRIFEX;
const port=process.env.PORT||4000;



app.use("/public/uploads", express.static(path.join("public", "uploads")));

app.use(bodyParser.json());
// Configure bodyParser to handle post requests
app.use(bodyParser.urlencoded({ extended: true }));



//user router
app.use(apiPrefix,UserRouters);

// task router

app.use(apiPrefix,TaskRouters);

//sub task router

app.use(apiPrefix,subTaskRouters);


dbConnect();


app.get('/',(req,res)=>{
    res.send("welcome to application")
})

app.listen(port,()=>{
    console.log(`server is running at ${port}`);
})