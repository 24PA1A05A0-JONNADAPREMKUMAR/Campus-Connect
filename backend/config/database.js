const { Sequelize } = require("sequelize");

require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DATABASE_URL || process.env.DB_NAME,
  process.env.DATABASE_URL
    ? {}
    : {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
      },
  {
    dialect: "postgres",
    logging: false,

    ...(process.env.DATABASE_URL && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }),
  }
);

module.exports = sequelize;