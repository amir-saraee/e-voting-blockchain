const { Sequelize } = require("sequelize");
const path = require("path");

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../../database.sqlite"),
  logging: false,
});

// Import models
const Election = require("./election")(sequelize);
const Candidate = require("./candidate")(sequelize);
const Vote = require("./vote")(sequelize);
const User = require("./user")(sequelize);

Election.hasMany(Candidate, { foreignKey: "electionId", as: "candidates" });
Candidate.belongsTo(Election, { foreignKey: "electionId", as: "election" });

Election.hasMany(Vote, { foreignKey: "electionId", as: "votes" });
Vote.belongsTo(Election, { foreignKey: "electionId", as: "election" });

Candidate.hasMany(Vote, { foreignKey: "candidateId", as: "votes" });
Vote.belongsTo(Candidate, { foreignKey: "candidateId", as: "candidate" });

module.exports = { sequelize, Election, Candidate, Vote, User };
