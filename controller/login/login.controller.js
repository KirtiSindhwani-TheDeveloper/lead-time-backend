const loginService=require('../../services/login/login.service')
module.exports={
    loginUser:async function(req,res){
        try{
            const token = await loginService.loginUser(req.body);
            return res.json({ message: 'Login successful' ,data:token,login:true});
        }
        catch(error){
            res.status(201).send({message:error.message,login:false})
        }
    },

    forgotPassword:async function(req,res){
        try {
            
            const response = await loginService.forgetPasswordService(req.body.email);
            // console.log(response)
            res.status(response.status).send({error:response.data,status:response.status});
          } catch (error) {
            console.error('Error in forget password controller:', error);
            res.status(500).json({ error: 'Unable to process request.' });
          }
    },
      // Verify OTP Controller
      verifyOTPController :async (req, res) => {
        try {
          const { otp, email } = req.body;
          console.log(otp,email)
          const response = await loginService.verifyOTPService(otp, email);
          res.status(response.status).send({error:response.data,status:response.status});
        } catch (error) {
          console.error('Error in OTP verification controller:', error);
          res.status(500).json({ error: 'Unable to validate OTP.' });
        }
      },
      
      // Reset Password Controller
      resetPasswordController :async (req, res) => {
        try {
          const { password, jwtToken } = req.body;
          const response = await loginService.resetPasswordService(password, jwtToken);
          res.status(response.status).send({error:response.data,status:response.status});
        } catch (error) {
          console.error('Error in reset password controller:', error);
          res.status(500).json({ error: 'Error in resetting password.' });
        }
      }
}