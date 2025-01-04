// config.js
require('dotenv').config(); // Load environment variables from the .env file
const sql=require('mssql2')

module.exports={
   
   server: process.env.DB_SERVER,  // Server name and instance
   database: process.env.DB_DATABASE,
   port:Number(process.env.DB_PORT),
   user:process.env.DB_USER,
   password:process.env.DB_PASSWORD,
   options: {
    // encrypt:true,
    trustedConnection:true,
    trustServerCertificate:true
   },
   connectionTimeout: 60000,  // 60 seconds for initial connection
  requestTimeout: 3600000
}
 


    



