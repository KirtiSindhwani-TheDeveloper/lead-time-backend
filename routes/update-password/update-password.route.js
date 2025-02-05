const express=require('express');
let router=express();
const { handlePasswordResetRequest, handlePasswordReset } = require('../../controller/update-password/update-password.controller');
router.post('/request-password-reset', handlePasswordResetRequest);

// Route for resetting the password
router.post('/reset-password/:token', handlePasswordReset);

module.exports = router;
