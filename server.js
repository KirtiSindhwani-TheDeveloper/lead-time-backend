// server.js
const express = require('express');
const cors=require('cors')
const routes=require('./routes/index')
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
// Initialize the app
const app = express();
app.use(express.json({ limit: '100mb' }));  // Change '50mb' to whatever size you need
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json())
app.set('trust proxy', true);
app.use(cors());
app.use((req, res, next) => {
  // If the request already has an X-Forwarded-For header, append the new client IP
  if (req.headers['x-forwarded-for']) {
    req.headers['x-forwarded-for'] = req.headers['x-forwarded-for'] + ', ' + req.connection.remoteAddress;
  } else {
    // Otherwise, set the new X-Forwarded-For header with the client IP
    req.headers['x-forwarded-for'] = req.connection.remoteAddress;
  }

  next();
});


const swaggerDefinition = {
  openapi: '3.0.0', // Swagger 3.0 specification
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'This is the API documentation for My API',
  },
  servers: [
    {
      url: 'http://localhost:3000',
    },
  ],
};

// Options for swagger-jsdoc
const options = {
  swaggerDefinition, 
  apis: ['./index/*.js'] // Path to the API routes
}

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const port = process.env.PORT||3000;
// console.log("port ",typeof port)


app.use('/api', routes);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
