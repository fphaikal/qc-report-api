const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 2025;

const auth = require("./routes/auth");
const finalInspection = require("./routes/finalInspectionRoute");

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}\nhttp://localhost:${port}/`);
});
