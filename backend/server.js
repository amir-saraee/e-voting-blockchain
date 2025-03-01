const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const { sequelize } = require("./src/models");
const electionRoutes = require("./src/routes/electionRoutes");
const candidateRoutes = require("./src/routes/candidateRoutes");
const authRoutes = require("./src/routes/authRoutes");
var cors = require("cors");

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);

sequelize
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    const { syncEventsFromChain } = require("./syncEvents");
    syncEventsFromChain();
  })
  .catch((err) => console.error("Database sync failed:", err));
