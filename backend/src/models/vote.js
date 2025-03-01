const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Vote",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      electionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      candidateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      voterAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      updatedAt: false,
    }
  );
};
