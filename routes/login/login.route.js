const express=require('express');
const loginController=require('../../controller/login/login.controller');
const router=express();

router.post('/user',loginController.loginUser)
router.post('/forgot-password',loginController.forgotPassword)
router.post('/verify-otp', loginController.verifyOTPController);
router.post('/reset-password', loginController.resetPasswordController);
module.exports=router


