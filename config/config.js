require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your_secret_key',
  JWT_EXPIRATION: '1h',  // JWT expiration time (can be configured)
};
