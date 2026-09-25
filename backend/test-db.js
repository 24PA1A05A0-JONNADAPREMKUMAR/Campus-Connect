const sequelize = require("./config/database");
const { User, Category, Event, Registration } = require("./models");

async function testDatabase() {
  try {
    await sequelize.authenticate();

    console.log("Database connection successful.");

    console.log("Models loaded:");
    console.log("User:", User.name);
    console.log("Category:", Category.name);
    console.log("Event:", Event.name);
    console.log("Registration:", Registration.name);

    await sequelize.close();

    console.log("Database connection closed.");
  } catch (error) {
    console.error("Database test failed:", error.message);
  }
}

testDatabase();