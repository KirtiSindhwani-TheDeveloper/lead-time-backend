// services/authService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connection=require('../../connection')
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
const login = async (email, password,res) => {
  // const user = userDatabase.find(u => u.username === username);
  pool=await connection.connectDB();
  const user = await findUserByUsername(pool,email,password);
  if (!user) {
    res.sendStatus(404).json({message:'Invalid Credentials',status:"404"});
    // throw new Error('Invalid credentials');
  }

findUserById=async (userId)=>{
    try {
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
      console.log("email ",email,password)
      let query=`SELECT userId,name,designationId,roleId,emailId,mobileNo,password,status,added_on,added_by,scope_user_id FROM [user] WHERE emailId = @email and password=@password`
    const result = await pool.request()
      .input('email',  email)
      .input('password',password)
      .query(query);
  //   console.log("result ",result)
    return result[0] || null;  // Return the first record, or null if not found
  } catch (err) {
    console.error('Error querying the database:', err);
    throw new Error('Database query failed');
  }
};

module.exports = {
  login,
  refreshAccessToken,
  protectedRoute
};
