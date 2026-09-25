const express = require("express");

const {
  Category,
} = require("../models");

const {
  requireRole,
} = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["name", "ASC"]],
    });

    res.json({
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      message: "Unable to fetch categories",
    });
  }
});

router.post(
  "/",
  requireRole("admin"),
  async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          message: "Category name is required",
        });
      }

      const existingCategory =
        await Category.findOne({
          where: { name },
        });

      if (existingCategory) {
        return res.status(409).json({
          message: "Category already exists",
        });
      }

      const category = await Category.create({
        name,
        description,
      });

      res.status(201).json({
        message: "Category created successfully",
        category,
      });
    } catch (error) {
      console.error("Create category error:", error);

      res.status(500).json({
        message: "Unable to create category",
      });
    }
  }
);

module.exports = router;