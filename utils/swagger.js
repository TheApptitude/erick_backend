// import swaggerJsdoc from "swagger-jsdoc"
// import swaggerUi from "swagger-ui-express"


// import { config } from "dotenv";
// config()
// // Swagger definition
// const swaggerOptions = {
//   swaggerDefinition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Erik API',
//       version: '1.0.0',
//     //   description: 'API endpoints for user registration',
//     },
//     servers: [
//       {
//         url: `http://localhost:${process.env.PORT}${process.env.API_PREFIX || ''}`, // Replace with your actual server URL
//         description: 'Development server',
//       },
//     ],
//   },
//   apis: ['./router/userRouter.js','./router/taskRouter.js','./router/subTaskRouter.js'], // Replace with the path to your actual routes file
// };

// const specs = swaggerJsdoc(swaggerOptions);

// export default function setupSwaggerDocs(app) {
//     // Serve Swagger API documentation
//     app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
//   }