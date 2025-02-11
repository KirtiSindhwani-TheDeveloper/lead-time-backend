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
  // const { secret, data_url } = await authService.generate2FA();
  // user.secret = secret; // Store the secret in user data or a session
  
  // res.render('verifyPage', { data_url });
  // res.json({ qrCodeUrl: data_url, secret });
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

 const verifyRouteController=async (req,res)=>{
  const { token } = req.body;
  const userId=req.body.userId;
// console.log(" token ",token)
  const user = { secret: req.body.secret }; // Retrieve user secret from your session or DB

  const isValid = await authService.verify2FA(user.secret, token,userId);
  //console.log("is valid in verify auth controller ",isValid)
  if (isValid) {
    return res.json({message:'2FA verified successfully!'});
  } else {
    return res.status(400).send('Invalid OTP');
  }
}

const generateQRCode=async (req,res)=>{

    try{
    const { secret, data_url } = await authService.generate2FA();
    res.status(200).json({ message: 'QR generate Successfully' ,qr:data_url,secret});
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
}

const updatePasswordWhileCreatingUser=async (req,res)=>{

  try{
    const result=await authService.updatePasswordWhileCreatingUser(req.body);
    res.status(200).json({message:'Successfully Updated',data:result})
  }catch(error){
    console.log("error ",error.message)
    res.status(201).json({message:'Successfully Updated'})
  }
}

const getEmails=async (req,res)=>{
  try{
    const result= await authService.getEmails(req);
    return res.status(200).json({data:result});

  }
  catch(error){
 console.log("error ",error.message)
   return res.status(201).json({message:'Error ',error:error.message})
  }
}
module.exports = { auth,refreshTokenController ,protectedRouteController,verifyRouteController,generateQRCode
  ,getEmails,updatePasswordWhileCreatingUser};
