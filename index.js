const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { initializeWhatsAppBot } = require("./lib/waBot");
const authMiddleware = require('./middleware/authMiddleware')

require('./cron/index');


const app = express();
const port = 2025;

const auth = require("./routes/auth");
const finalInspection = require("./routes/finalInspectionRoute");
const ncr = require("./routes/ncrRoute")
const ipr = require("./routes/iprRoute")
const ngData = require("./routes/ngDataRoute");

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send({
    message: "API For QC Report Denapella",
    author: "FPHaikal",
  });
});

app.use("/api/auth", auth);
app.use("/api/report/final-inspection", authMiddleware,finalInspection);
app.use("/api/report/ncr", authMiddleware,ncr);
app.use("/api/report/ipr", authMiddleware,ipr);
app.use("/api/report/ngData", authMiddleware,ngData);

  
app.listen(port, () => {
  console.log(`Server is running on port ${port}\nhttp://localhost:${port}/`);
});
