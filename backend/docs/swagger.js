import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "SkyReserve API",
      version: "1.0.0",
      description: "Airline Reservation & Management System API"
    },

    servers: [
      {
        url: "http://localhost:5000"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },

  apis: [
    "./src/modules/**/*.routes.js"
  ]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;