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
    components: {
      securitySchemes: {
        JWTAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'JWT Token. Include the JWT in the Authorization header without the "Bearer" prefix.',
        },
      },
    },
    security: [
      {
        JWTAuth: [],
      },
    ],
    tags: [
      {
        name: 'Final Inspection',
        description: 'Routes related to final inspection'
      },
      {
        name: 'IPR',
        description: 'Routes related to IPR'
      },
      {
        name: 'NCR',
        description: 'Routes related to NCR'
      }
    ],
    servers: [{ url: 'http://localhost:2025' }],
  },
  apis: ['../routes/*.js'], // Path ke file API
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
module.exports = { swaggerUi, swaggerDocs };
