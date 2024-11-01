const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require('./cron/index');

const swaggerJsDoc = require('swagger-jsdoc');
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
  apis: ['./routes/*.js'], // Path ke file API Anda
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const port = 2025;

const auth = require("./routes/auth");
const finalInspection = require("./routes/finalInspectionRoute");
const ncr = require("./routes/ncrRoute")
const ipr = require("./routes/iprRoute")
const ngData = require("./routes/ngDataRoute");
const parts = require("./routes/partsRoute");

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send({
    message: "API For QC Report Denapella",
    author: "FPHaikal",
  });
});

app.use("/api/auth", auth);
app.use("/api/report/final-inspection", finalInspection);
app.use("/api/report/ncr", ncr);
app.use("/api/report/ipr", ipr);
app.use("/api/report/ngData", ngData);
app.use("/api/data/parts", parts);

app.listen(port, () => {
  console.log(`Server is running on port ${port}\nhttp://localhost:${port}/`);
  console.log(`Dokumentasi API tersedia di http://localhost:${port}/api-docs`);
});
