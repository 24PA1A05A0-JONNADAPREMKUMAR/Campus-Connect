const User = require("./User");
const Category = require("./Category");
const Event = require("./Event");
const Registration = require("./Registration");

// Organizer → Events
User.hasMany(Event, {
  foreignKey: "organizerId",
  as: "organizedEvents",
});

Event.belongsTo(User, {
  foreignKey: "organizerId",
  as: "organizer",
});

// Category → Events
Category.hasMany(Event, {
  foreignKey: "categoryId",
  as: "events",
});

Event.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

// Student → Registrations
User.hasMany(Registration, {
  foreignKey: "studentId",
  as: "registrations",
});

Registration.belongsTo(User, {
  foreignKey: "studentId",
  as: "student",
});

// Event → Registrations
Event.hasMany(Registration, {
  foreignKey: "eventId",
  as: "registrations",
});

Registration.belongsTo(Event, {
  foreignKey: "eventId",
  as: "event",
});

module.exports = {
  User,
  Category,
  Event,
  Registration,
};