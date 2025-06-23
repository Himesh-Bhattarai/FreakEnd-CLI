const express = require("express");
const router = express.Router();
const { login } = require("../controllers/login.controller");
const { validateLogin } = require("../middleware/login.middleware");

// Public Routes
router.post("/login", validateLogin, login);

// Health check route
router.get("/health", (req, res) => {
  res.json({ status: "Auth service is running" });
});

module.exports = router;
