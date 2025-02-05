// src/routes/auth.routes.js

const express = require("express");
const { auth,refreshTokenController,protectedRouteController,verifyRouteController,generateQRCode } = require("../../controller/login/auth.controller");

const router = express.Router();

// Unified route for login and refresh token
router.post("/auth", auth);
// router.post('/login', loginController);

// Route for refreshing access token
router.post('/refresh', refreshTokenController);
router.get('/protected', protectedRouteController);
router.post('/verify', verifyRouteController);
router.get('/generate-qr',generateQRCode)
module.exports = router;
