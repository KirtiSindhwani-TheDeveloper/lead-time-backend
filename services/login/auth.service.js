// services/authService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connection=require('../../connection')
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, username: user.email }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
  });
};

// Verify Access Token
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

// Verify Refresh Token
const verifyRefreshToken = async(token) => {
   return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

}
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, username: user.email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
};

// // Generate Refresh Token
// const generateRefreshToken = (user) => {
//   return jwt.sign({ id: user.id, username: user.username }, REFRESH_TOKEN_SECRET, {
//     expiresIn: REFRESH_TOKEN_EXPIRATION,
//   });
// };





// Login Service
const login = async (email, password) => {
  // const user = userDatabase.find(u => u.username === username);
  pool=await connection.connectDB();
  const user = await findUserByUsername(pool,email,password);
  if (!user) {
    res.sendStatus(404).json({message:'Invalid Credentials',status:"404"});
    // throw new Error('Invalid credentials');
  }

findUserById=async (userId)=>{
    try {
     // console.log("user id ",userId)
      pool=await connection.connectDB();
    let query=`SELECT * FROM [user] WHERE userId=@userId`
  const result = await pool.request()
    .input('userId',  userId)
    .query(query);
//   console.log("result ",result)
  return result[0] || null;  // Return the first record, or null if not found
} catch (err) {
  console.error('Error querying the database:', err);
  throw new Error('Database query failed');
}
}
  // const isPasswordValid = bcrypt.compareSync(password, user.password);
  // if (!isPasswordValid) {
  //   throw new Error('Invalid credentials');
  // }

  // Generate tokens
  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);
  await insertAuditLog(pool,refreshToken,user.userId);
//  console.log(accessToken,refreshToken)
   return { accessToken, refreshToken,user };

};

const protectedRoute = (token) => {
  try {
    // Verify the access token
    const decoded = verifyAccessToken(token);
    const user = userDatabase.find(u => u.id === decoded.id);
    
    if (!user) {
      throw new Error('Unauthorized');
    }

    return { message: 'This is protected data', user: user.email };
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};
// Refresh Token Service
const refreshAccessToken = async(refreshToken,userId) => {
  try {
    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);
    console.log("decode in refressh",decoded)
     const user = await findUserById(decoded.id)
    //  userDatabase.find(u => u.id === decoded.id);
    
    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // Generate a new access token
    const newAccessToken = await generateAccessToken(user);
    return newAccessToken;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

const insertAuditLog= async (pool,refreshToken,userId)=>{

  let query =` UPDATE [user] SET token = @refreshToken WHERE userId = @userId`;

  await pool.request()
      .input('refreshToken', refreshToken)
      .input('userId',userId)
      .query(query);
  
  console.log("--log inserted successfully");
  
}
const findUserByUsername = async (pool,email,password) => {
    
  try {
      //console.log("email ",email,password)
      let query=`SELECT userId,name,designationId,roleId,emailId,mobileNo,password,added_on,added_by,scope_user_id,secretKey FROM [user] WHERE emailId = @email and password=@password and status='Active'`
    const result = await pool.request()
      .input('email',  email)
      .input('password',password)
      .query(query);
  //  console.log("result ",result)
    return result[0] || null;  // Return the first record, or null if not found
  } catch (err) {
    console.error('Error querying the database:', err);
    throw new Error('Database query failed');
  }
};
const generate2FA = async () => {
  const secret = await speakeasy.generateSecret({ length: 20 });
 // console.log("Generated secret: ", secret.base32);
  // Generate a QR code URL that users will scan with Google Authenticator
  return new Promise((resolve, reject) => {
    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        return reject('Error generating QR code');
      }
      resolve({ secret: secret.base32, data_url });
    });
  });
}
 async  function verify2FA (secret, token,userId) {

  //console.log("verify ",secret,token,userId)
  try{
    const pool=await connection.connectDB();

    let query=`Update [user] set secretKey=@secret ,token=@token ,isGoogleAuthentication=1 where userId=@userId;`

    await pool.request().input('userId',userId)
    .input('token',token).input('secret',secret).query(query);

    const isValid = speakeasy.totp.verify({
      secret,  // The secret generated and stored
      encoding: 'base32',
      token,   // The OTP entered by the user
      window: 2, // Number of allowable time steps (default is 1, can be increased to allow some leeway) expires in 30*5 =150 seconds
    });
    //console.log("is valid ",isValid)
  return isValid
  }
  catch(error){
 console.log("error in verify in auth service ",error.message)
  }
};

const updatePasswordWhileCreatingUser=async(req)=>{

  try{
    const pool=await connection.connectDB();
    let email=req.email;
    let secret=req.secretKey;
    let password=req.password;
    let query=`Update [user] set password=@password, secretKey=@secret , isGoogleAuthentication=1 where emailId=@email`;
    await pool.request().input('secret',secret)
    .input('email',email)
    .input('password',password).query(query);
  }
  catch(error){

    console.log("error in auth service updatepassword while creating user ",error.message)
    return error;
  }
}

const getEmails=async(req)=>{
//   const { email } = req;
  //console.log(req.email)
  try {
    // Connect to the SQL Server
    const pool=await connection.connectDB();

    // Query to check if the email exists
    const result = await pool.request().query`
      SELECT emailId,name  FROM [User]
    `;

    // Check if the email is already in the database
    return result;
  } catch (error) {
    console.error('Error checking email:', error);
    // return res.status(500).json({ message: 'Server error' });
  }
}
module.exports = {
  login,
  refreshAccessToken,
  protectedRoute,
  generate2FA,
  verify2FA,
  getEmails,
  updatePasswordWhileCreatingUser
};
