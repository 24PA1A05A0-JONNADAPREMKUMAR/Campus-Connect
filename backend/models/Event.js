const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Event = sequelize.define(
  "Event",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Event title is required",
        },
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Event description is required",
        },
      },
    },

    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    venue: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: "Capacity must be at least 1",
        },
      },
    },

    status: {
      type: DataTypes.ENUM("upcoming", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "upcoming",
    },

    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Events",
  }
);

module.exports = Event;