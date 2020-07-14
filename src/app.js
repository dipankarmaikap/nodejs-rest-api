const express = require("express");
require("dotenv").config();
require("./database/db");
const cors = require("cors");
const app = express();
const userRoutes = require("./router/user-router");

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);

const port = 3000;
app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);

