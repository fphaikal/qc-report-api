const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Auto-generated documentation with Swagger',
    },
    servers: [{ url: 'http://localhost:2025' }],
  },
  apis: ['../routes/*.js'], // Path ke file API
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
module.exports = { swaggerUi, swaggerDocs };
