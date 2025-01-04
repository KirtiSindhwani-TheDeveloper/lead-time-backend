// src/controllers/auth.controller.js

const { login, refreshAccessToken } = require('../../services/login/auth.service');

// Login or Refresh Access Token
const auth = async (req, res) => {
  const { email, userPassword, refreshToken } = req.body;

  if (refreshToken) {
    // If a refresh token is provided, refresh the access token
    return refreshAccessToken(refreshToken, res);
  }

  // Otherwise, attempt login with email and password
  return login(email, userPassword, res);
};

module.exports = { auth };
