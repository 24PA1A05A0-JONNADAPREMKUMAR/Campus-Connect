const express = require("express");

const { User } = require("../models");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

/*
  GET /api/users
  Admin can view all users.
*/
router.get(
  "/",
  requireRole("admin"),
  async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: [
          "id",
          "name",
          "email",
          "role",
          "createdAt",
        ],

        order: [["createdAt", "DESC"]],
      });

      return res.json({
        users,
      });
    } catch (error) {
      console.error("Get users error:", error);

      return res.status(500).json({
        message: "Unable to fetch users",
      });
    }
  }
);

/*
  PUT /api/users/:id/role
  Admin can change another user's role.
*/
router.put(
  "/:id/role",
  requireRole("admin"),
  async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const { role } = req.body;

      const allowedRoles = [
        "student",
        "organizer",
        "admin",
      ];

      if (!Number.isInteger(userId)) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message:
            "Role must be student, organizer or admin",
        });
      }

      /*
        Prevent an admin from accidentally removing
        their own admin access.
      */
      if (userId === req.user.id) {
        return res.status(400).json({
          message: "You cannot change your own role",
        });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      await user.update({
        role,
      });

      return res.json({
        message: "User role updated successfully",

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Update user role error:", error);

      return res.status(500).json({
        message: "Unable to update user role",
      });
    }
  }
);

module.exports = router;