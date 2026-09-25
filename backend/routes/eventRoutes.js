const express = require("express");

const {
  Event,
  Category,
  User,
  Registration,
} = require("../models");

const { requireRole } = require("../middleware/auth");

const router = express.Router();

/*
  Helper:
  Add registration count and remaining seats to an event.
*/
const addEventStats = async (event) => {
  const registeredCount = await Registration.count({
    where: {
      eventId: event.id,
      status: "registered",
    },
  });

  const eventData = event.toJSON();

  eventData.registrationCount = registeredCount;
  eventData.remainingSeats = Math.max(
    event.capacity - registeredCount,
    0
  );

  return eventData;
};

/*
  GET /api/events
  Public list of upcoming events
*/
router.get("/", async (req, res) => {
  try {
    const events = await Event.findAll({
      where: {
        status: "upcoming",
      },

      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },

        {
          model: User,
          as: "organizer",
          attributes: ["id", "name"],
        },
      ],

      order: [
        ["eventDate", "ASC"],
        ["startTime", "ASC"],
      ],
    });

    const eventsWithStats = await Promise.all(
      events.map(addEventStats)
    );

    res.json({
      events: eventsWithStats,
    });
  } catch (error) {
    console.error("Get events error:", error);

    res.status(500).json({
      message: "Unable to fetch events",
    });
  }
});

/*
  GET /api/events/admin/all
  Admin sees all events
*/
router.get("/admin/all", requireRole("admin"), async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "organizer",
          attributes: ["id", "name", "email"],
        },
      ],

      order: [
        ["eventDate", "ASC"],
        ["startTime", "ASC"],
      ],
    });

    const eventsWithStats = await Promise.all(
      events.map(addEventStats)
    );

    return res.json({
      events: eventsWithStats,
    });
  } catch (error) {
    console.error("Admin events error:", error);

    return res.status(500).json({
      message: "Unable to fetch all events",
    });
  }
});

/*
  GET /api/events/my-registrations
  Student sees their registrations
*/
router.get(
  "/my-registrations",
  requireRole("student"),
  async (req, res) => {
    try {
      const registrations = await Registration.findAll({
        where: {
          studentId: req.user.id,
        },

        include: [
          {
            model: Event,
            as: "event",
            include: [
              {
                model: Category,
                as: "category",
                attributes: ["id", "name"],
              },
              {
                model: User,
                as: "organizer",
                attributes: ["id", "name"],
              },
            ],
          },
        ],

        order: [["registeredAt", "DESC"]],
      });

      return res.json({
        registrations,
      });
    } catch (error) {
      console.error("Get registrations error:", error);

      return res.status(500).json({
        message: "Unable to fetch registrations",
      });
    }
  }
);

/*
  GET /api/events/:id
  Get one event
*/
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: "category",
        },

        {
          model: User,
          as: "organizer",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const eventWithStats = await addEventStats(event);

    return res.json({
      event: eventWithStats,
    });
  } catch (error) {
    console.error("Get event error:", error);

    return res.status(500).json({
      message: "Unable to fetch event",
    });
  }
});

/*
  POST /api/events
  Organizer/Admin creates an event
*/
router.post(
  "/",
  requireRole("organizer", "admin"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        eventDate,
        startTime,
        venue,
        capacity,
        categoryId,
      } = req.body;

      if (
        !title ||
        !description ||
        !eventDate ||
        !startTime ||
        !venue ||
        !capacity ||
        !categoryId
      ) {
        return res.status(400).json({
          message: "All event fields are required",
        });
      }

      const category = await Category.findByPk(categoryId);

      if (!category) {
        return res.status(400).json({
          message: "Invalid category",
        });
      }

      const numericCapacity = Number(capacity);

      if (
        !Number.isInteger(numericCapacity) ||
        numericCapacity < 1
      ) {
        return res.status(400).json({
          message: "Capacity must be at least 1",
        });
      }

      const event = await Event.create({
        title,
        description,
        eventDate,
        startTime,
        venue,
        capacity: numericCapacity,
        categoryId,
        organizerId: req.user.id,
        status: "upcoming",
      });

      return res.status(201).json({
        message: "Event created successfully",
        event,
      });
    } catch (error) {
      console.error("Create event error:", error);

      return res.status(500).json({
        message: "Unable to create event",
      });
    }
  }
);

/*
  PUT /api/events/:id
  Organizer/Admin updates event
*/
router.put(
  "/:id",
  requireRole("organizer", "admin"),
  async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id);

      if (!event) {
        return res.status(404).json({
          message: "Event not found",
        });
      }

      if (
        req.user.role !== "admin" &&
        event.organizerId !== req.user.id
      ) {
        return res.status(403).json({
          message: "You can only modify your own events",
        });
      }

      const {
        title,
        description,
        eventDate,
        startTime,
        venue,
        capacity,
        categoryId,
        status,
      } = req.body;

      const numericCapacity = Number(capacity);

      if (
        !Number.isInteger(numericCapacity) ||
        numericCapacity < 1
      ) {
        return res.status(400).json({
          message: "Capacity must be at least 1",
        });
      }

      const registeredCount = await Registration.count({
        where: {
          eventId: event.id,
          status: "registered",
        },
      });

      if (numericCapacity < registeredCount) {
        return res.status(400).json({
          message:
            `Capacity cannot be less than the current ` +
            `${registeredCount} registered students`,
        });
      }

      await event.update({
        title,
        description,
        eventDate,
        startTime,
        venue,
        capacity: numericCapacity,
        categoryId,
        status,
      });

      return res.json({
        message: "Event updated successfully",
        event,
      });
    } catch (error) {
      console.error("Update event error:", error);

      return res.status(500).json({
        message: "Unable to update event",
      });
    }
  }
);

/*
  DELETE /api/events/:id
*/
router.delete(
  "/:id",
  requireRole("organizer", "admin"),
  async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id);

      if (!event) {
        return res.status(404).json({
          message: "Event not found",
        });
      }

      if (
        req.user.role !== "admin" &&
        event.organizerId !== req.user.id
      ) {
        return res.status(403).json({
          message: "You can only delete your own events",
        });
      }

      await event.destroy();

      return res.json({
        message: "Event deleted successfully",
      });
    } catch (error) {
      console.error("Delete event error:", error);

      return res.status(500).json({
        message: "Unable to delete event",
      });
    }
  }
);

/*
  POST /api/events/:id/register
  Student registers for an event
*/
router.post(
  "/:id/register",
  requireRole("student"),
  async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id);

      if (!event) {
        return res.status(404).json({
          message: "Event not found",
        });
      }

      if (event.status !== "upcoming") {
        return res.status(400).json({
          message:
            "Registration is not available for this event",
        });
      }

      /*
        Check duplicate registration first.
      */
      const existingRegistration =
        await Registration.findOne({
          where: {
            studentId: req.user.id,
            eventId: event.id,
            status: "registered",
          },
        });

      if (existingRegistration) {
        return res.status(409).json({
          message:
            "You are already registered for this event",
        });
      }

      /*
        Count current active registrations.
      */
      const registeredCount =
        await Registration.count({
          where: {
            eventId: event.id,
            status: "registered",
          },
        });

      /*
        Never allow registrations beyond capacity.
      */
      if (registeredCount >= event.capacity) {
        return res.status(400).json({
          message: "This event is full",
        });
      }

      const registration =
        await Registration.create({
          studentId: req.user.id,
          eventId: event.id,
          status: "registered",
        });

      const newRegisteredCount = registeredCount + 1;

      return res.status(201).json({
        message: "Registered for event successfully",

        registration,

        registrationCount: newRegisteredCount,

        remainingSeats: Math.max(
          event.capacity - newRegisteredCount,
          0
        ),
      });
    } catch (error) {
      console.error("Registration error:", error);

      return res.status(500).json({
        message: "Unable to register for event",
      });
    }
  }
);

module.exports = router;

