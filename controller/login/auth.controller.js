// src/controllers/auth.controller.js

const { password } = require('../../dbConfig');
const authService = require('../../services/login/auth.service');

// Login or Refresh Access Token
const auth = async (req, res) => {
  const { email, userPassword } = req.body;

  try {
    const { accessToken, refreshToken,user } = await authService.login(email, userPassword,res);
    // console.log(accessToken,refreshToken)
  //   res.cookie('accessToken', accessToken, {
  //     httpOnly: true,
  //     secure: true,
  //     // maxAge: 15 * 60 * 1000,
  //     // sameSite: 'None',
  // });

  // res.cookie('refreshToken', refreshToken, {
  //     httpOnly: true,
  //     secure: true,
  //     // maxAge: 7 * 24 * 60 * 60 * 1000,
  //     // sameSite: 'None',
  // });

  res.status(200).json({ message: 'Login successful' ,accessToken,refreshToken,user});
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
const refreshTokenController = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const newAccessToken = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

const protectedRouteController = (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const result = authService.protectedRoute(token);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = { auth,refreshTokenController ,protectedRouteController};
