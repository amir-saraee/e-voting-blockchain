const { sequelize } = require("./src/models");

async function resetDatabase() {
  try {
    // force: true drops tables and recreates them based on the models
    await sequelize.sync({ force: true });
    console.log("Database has been reset.");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
}

resetDatabase();
