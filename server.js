// const express = require('express');
// const app = express();
// const dotenv = require('dotenv');
// const morgan = require('morgan');
// const mongoose = require('mongoose');
// const swaggerJSDoc = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express');

// dotenv.config();

// const userRouter = require('./Routes/user');
// const userAuth = require('./Routes/auth');
// const userPost = require('./Routes/post');

// const port = 2020;

// app.use(express.json());
// app.use(morgan("combined"));

// // Swagger setup
// const swaggerOptions = {
//     swaggerDefinition: {
//         openapi: '3.0.0',
//         info: {
//             title: 'Social Media API',
//             version: '1.0.0',
//             description: 'API for managing users, posts, and comments in a social media platform.'
//         },
//         host: 'localhost:2020',
//         basePath: '/api',
//         schemes: ['http']
//     },
//     apis: ['./Routes/*.js'] // Path to the API files
// };

// const swaggerSpec = swaggerJSDoc(swaggerOptions);

// // Route setup
// app.use("/api/user", userRouter);
// app.use("/api/auth", userAuth);
// app.use("/api/post", userPost);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// // MongoDB connection
// const mongoDBUrl = process.env.MONGO_URL;

// if (!mongoDBUrl) {
//     console.error("MONGO_URL is not defined in the environment variables.");
//     process.exit(1); // Exit the process with an error
// }

// mongoose.connect(mongoDBUrl, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
// .then(() => {
//     console.log("Connected to MongoDB");
// })
// .catch(err => {
//     console.error("Failed to connect to MongoDB", err);
// });

// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

dotenv.config();

const userRouter = require('./Routes/user');
const userAuth = require('./Routes/auth');
const userPost = require('./Routes/post');

const port = process.env.PORT || 2020;

app.use(express.json());
app.use(morgan("combined"));

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Social Media API',
            version: '1.0.0',
            description: 'API for managing users, posts, and comments in a social media platform.'
        },
        host: `localhost:${port}`,
        basePath: '/api',
        schemes: ['http']
    },
    apis: ['./Routes/*.js'] // Path to the API files
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Route setup
app.use("/api/user", userRouter);
app.use("/api/auth", userAuth);
app.use("/api/post", userPost);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// MongoDB connection
const mongoDBUrl = process.env.MONGO_URL;

if (!mongoDBUrl) {
    console.error("MONGO_URL is not defined in the environment variables.");
    process.exit(1); // Exit the process with an error
}

mongoose.connect(mongoDBUrl)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.error("Failed to connect to MongoDB", err);
    });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}).on('error', (err) => {
    console.error('Failed to start server:', err);
});
