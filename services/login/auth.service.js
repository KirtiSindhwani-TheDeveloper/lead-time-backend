// src/services/auth.service.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection=require('../../connection')

// Create access token
const createAccessToken = (user) => {
  return jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
};

// Create refresh token
const createRefreshToken = (user) => {
  return jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
  });
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return null;
  }
};

// Compare password with hashed password
const comparePassword = async (plainTextPassword, hashedPassword) => {
  return bcrypt.compare(plainTextPassword, hashedPassword);
};

// Login method: Validate credentials and return tokens
const login = async (email, password, res) => {
    console.log(email,password)
    pool=await connection.connectDB();
    const user = await findUserByUsername(pool,email,password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
//   const isMatch = await comparePassword(password, user.password);

//   if (!isMatch) {
//     return res.status(401).json({ message: "Invalid credentials" });
//   }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

 await insertAuditLog(pool,refreshToken,user.userId);
  // Send tokens as cookies
  res.cookie("accessToken", accessToken, {
    // httpOnly: true,
    // secure: process.env.NODE_ENV === "production",  // Ensure secure cookies in production
    maxAge: 15 * 60 * 1000,  // 15 minutes
    // sameSite: "Strict",
  });

  res.cookie("refreshToken", refreshToken, {
    // httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
    // sameSite: "Strict",
  });

  return res.json({ message: "Login successful" ,user:user});
};

// Refresh access token method
const refreshAccessToken = (refreshToken, res) => {
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }

  const newAccessToken = createAccessToken({ id: decoded.userId });

  // Send the new access token as a cookie
  res.cookie("accessToken", newAccessToken, {
    // httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000,  // 15 minutes
    // sameSite: "Strict",
  });

  return res.json({ message: "Access token refreshed" });
};
const findUserByUsername = async (pool,email,password) => {
    
    try {
        console.log("email ",email,password)
        let query=`SELECT * FROM [user] WHERE emailId = @email and password=@password`
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
 const insertAuditLog= async (pool,refreshToken,userId)=>{

    let query = `UPDATE [user] SET token = @refreshToken WHERE userId = @userId`;

    await pool.request()
        .input('refreshToken', refreshToken)
        .input('userId',userId)
        .query(query);
    
    console.log("--log inserted successfully");
    
 }
module.exports = {
  login,
  refreshAccessToken,
};
