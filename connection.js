const sql=require('mssql2')
const config={
    // server: 'DESKTOP-ONAE3K9\\SQLEXPRESS01',  // Server name and instance
    // database: 'Lead-Time',
    // user:'newAdmin',
    // password:'12345678',
    // options: {
    //  trustedConnection:true,
    //  trustServerCertificate:true,
    // //  encrypt:false,
    // //  enableArithAbort:true
    // },
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
    JWT_SECRET: process.env.JWT_SECRET || 'secretKey',
    JWT_EXPIRATION: '1h',  // JWT expiration time (can be configured)
    connectionTimeout: 60000,  // 60 seconds for initial connection
   requestTimeout: 3600000
   }

module.exports={
  
   connectDB:async ()=>{
       try {
         let pool;
            pool = await sql.connect(config);
           console.log("Connection Created");
           return pool
       } catch (error) {
           console.log("Error in Connection- ",error);
       }
   }
}