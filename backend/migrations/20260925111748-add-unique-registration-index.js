"use strict";

module.exports = {
  async up(queryInterface) {
    const indexes = await queryInterface.showIndex("Registrations");

    const indexExists = indexes.some(
      (index) =>
        index.name === "unique_student_event_registration"
    );

    if (!indexExists) {
      await queryInterface.addIndex(
        "Registrations",
        ["studentId", "eventId"],
        {
          unique: true,
          name: "unique_student_event_registration",
        }
      );
    }
  },

  async down(queryInterface) {
    const indexes = await queryInterface.showIndex("Registrations");

    const indexExists = indexes.some(
      (index) =>
        index.name === "unique_student_event_registration"
    );

    if (indexExists) {
      await queryInterface.removeIndex(
        "Registrations",
        "unique_student_event_registration"
      );
    }
  },
};