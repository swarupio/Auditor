const express = require("express");
const path = require("path");
const auditRouter = require("./routes/audit");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api", auditRouter);

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Page Pulse running on http://localhost:${PORT}`);
  });
}

module.exports = app;