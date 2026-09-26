const express = require("express");
const cors = require("cors");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("./config/passport");
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);  

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.json({
    message: "CampusConnect API is running",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();

    res.json({
      status: "success",
      message: "CampusConnect API and PostgreSQL are connected",
    });
    } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

module.exports = app;