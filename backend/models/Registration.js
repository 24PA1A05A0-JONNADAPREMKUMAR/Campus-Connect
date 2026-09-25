const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Registration = sequelize.define(
  "Registration",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("registered", "cancelled"),
      allowNull: false,
      defaultValue: "registered",
    },

    registeredAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Registrations",

    indexes: [
      {
        unique: true,
        fields: ["studentId", "eventId"],
      },
    ],
  }
);

module.exports = Registration;

