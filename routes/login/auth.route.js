// src/routes/auth.routes.js

const express = require("express");
const { auth,refreshTokenController,protectedRouteController } = require("../../controller/login/auth.controller");

const router = express.Router();

// Unified route for login and refresh token
router.post("/auth", auth);
// router.post('/login', loginController);

// Route for refreshing access token
router.post('/refresh', refreshTokenController);
router.get('/protected', protectedRouteController);

module.exports = router;
