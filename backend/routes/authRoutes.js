const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("../config/passport");

const { User } = require("../models");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

if (!name?.trim() || !email?.trim() || !password) {
  return res.status(400).json({
    message: "Name, email and password are required",
  });
}

const normalizedEmail = email.trim().toLowerCase();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailPattern.test(normalizedEmail)) {
  return res.status(400).json({
    message: "Please enter a valid email address",
  });
}
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
  where: { email: normalizedEmail },
});

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
    });

    return res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      message: "Unable to create account",
    });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).json({
        message: info?.message || "Invalid email or password",
      });
    }

    req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      return res.json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie("connect.sid");

      return res.json({
        message: "Logged out successfully",
      });
    });
  });
});

router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  return res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;