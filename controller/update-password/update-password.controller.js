const updatePassService = require('../../services/update-password/update-password.service');

// Controller for handling the password reset request
const handlePasswordResetRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await updatePassService.requestPasswordReset(email);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Controller for resetting the password
const handlePasswordReset = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const response = await updatePassService.resetPassword(token, password);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { handlePasswordResetRequest, handlePasswordReset };
