// src/routes/auth.routes.js

const express = require("express");
const { auth } = require("../../controller/login/auth.controller");

const router = express.Router();

// Unified route for login and refresh token
router.post("/auth", auth);

module.exports = router;
