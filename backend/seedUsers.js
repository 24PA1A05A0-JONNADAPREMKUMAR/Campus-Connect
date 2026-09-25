const bcrypt = require("bcrypt");

const sequelize = require("./config/database");
const { User } = require("./models");

async function seedUsers() {
  try {
    await sequelize.authenticate();

    const password = await bcrypt.hash(
      "Admin@123",
      10
    );

    await User.findOrCreate({
      where: {
        email: "admin@campusconnect.com",
      },
      defaults: {
        name: "CampusConnect Admin",
        email: "admin@campusconnect.com",
        password,
        role: "admin",
      },
    });

    const organizerPassword = await bcrypt.hash(
      "Organizer@123",
      10
    );

    await User.findOrCreate({
      where: {
        email: "organizer@campusconnect.com",
      },
      defaults: {
        name: "Campus Event Organizer",
        email: "organizer@campusconnect.com",
        password: organizerPassword,
        role: "organizer",
      },
    });

    console.log("Admin and organizer created successfully.");

    await sequelize.close();
  } catch (error) {
    console.error("Seed failed:", error);
  }
}

seedUsers();