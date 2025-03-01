// election.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Election", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM("notStarted", "ongoing", "ended"),
      defaultValue: "notStarted",
    },
    // New eligibility fields:
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // if true, no restrictions apply
    },
    minAge: {
      type: DataTypes.INTEGER,
      allowNull: true, // set only if restrictions apply
    },
    requiredEducation: {
      type: DataTypes.STRING,
      allowNull: true, // set only if restrictions apply
    },
  });
};
