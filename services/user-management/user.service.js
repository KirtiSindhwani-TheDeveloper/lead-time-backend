const sql=require('mssql2');
const connection=require('../../connection');
const { password } = require('../../dbConfig');
const crypto = require('crypto');
const nodemailer=require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAILID,
      pass: process.env.EMAILPASSWORD,
    },
  });
const { getLocalIp, getPublicIp, getClientIp } = require("../getIP");
module.exports={
    getUsers:async function(){
        try{
            const pool=await connection.connectDB();
            let query=`Select name ,userId from [user]`;
            const result=await pool.request().query(query);
            // console.log("----------",result)
            return result;
        }
        catch(error){
            console.log("error in user service ",error.message)
        }
    },

    createUser:async function(req){
        try{
            let userName=req.name;
            let link=req?.link;
            let designationId=req.designation;
            let roleId=req.role;
            let email=req.email;
            let mobileNo=req.mobileNo;
           // let password=req.password;
            let addedBy=req.userId;
            let businessVertical=req.associatedBusiness;
            let token=req.token;
            let status=req.status;
            let clientIp = getClientIp(req);
            let localIp = getLocalIp();
            let password = await generatePassword(9);
           // console.log("password generate in user service ",password)
            let publicIp = "Fetching public IP..."
            publicIp = await getPublicIp();
            let pool=await connection.connectDB();
            let query=`Insert into [user] (name,designationId,roleId,emailId,mobileNo,password,status,added_by,business_vertical) 
            OUTPUT INSERTED.userId   values (@userName,@designationId,@roleId,@email,@mobileNo,@password,@status,@addedBy,@businessVertical)`;
            
            let result=await pool.request().input('userName',userName)
            .input('designationId',designationId).input('roleId',roleId)
            .input('email',email).input('mobileNo',mobileNo).input('password',password)
            .input('addedBy',addedBy).input('businessVertical',businessVertical).input('status',status)
            .query(query);
            //console.log("create user result ",result)
            let insertedId=result[0].userId;
            const newUserIdFormatted = `SCS$${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${insertedId}`;
           // console.log(newUserIdFormatted)
            let updateQuery = `
            UPDATE [user] SET newUserID = @newUserIdFormatted WHERE userId = @insertedId;
        `;
            await pool.request()
            .input('newUserIdFormatted', newUserIdFormatted)
            .input('insertedId', insertedId)
            .query(updateQuery);
            let query2='';
             if(status=='Active'){
                 query2=`Insert into  Audit_log(userID,status,
                IP,token,newUserID,operation)  values(@addedBy,1,@publicIp,@token,
                @newUserIdFormatted,'user creation')`;
             }
             else{
                query2=`Insert into  Audit_log(userID,status,
                IP,token,newUserID,operation)  values(@addedBy,0,@publicIp,@token,
                @newUserIdFormatted,'user creation')`;
             }
            // console.log("----------",result)
            await pool.request().input('addedBy',addedBy)
            .input('publicIp',publicIp).input('token',token).input('newUserIdFormatted',newUserIdFormatted)
            .query(query2)

            console.log("link generated ",link)
            let mailOptions = {
                from: process.env.EMAILID, // Sender address
                to: email, // List of receivers
                subject: 'Create Password', // Subject line
                html: `Dear ${userName},<br><br>
                You can create your password with the link given below:<br>
               Link for accessing:- ${link} `, // Plain text body
                // html: '<b>This is a test email sent from Node.js using Nodemailer!</b>' // HTML body (optional)
              };
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log('Error: ' + error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
            return result;
        }
        catch(error){
            console.log("error in create user service ",error.message);
            return error;
        }
    },

    allUsers:async function(req){
        try{
            const pool=await connection.connectDB();
            let query=`Select userId, newUserId,name, roleId,designationId,business_vertical,emailId,mobileNo,status from [user]`;
            const result=await pool.request().query(query);
            // console.log("----------",result)
            return result;
        }
        catch(error){
            console.log("error in view user service ",error.message)
        }
    },

    deleteUser:async function(req){
        try{
            let userId=req.loginUserId;
            let id=req.userId;
            //console.log(req,id)
            let status=req.status;
            let token=req.token;
            let query=''
            let newUserId=req.newUserId;
            let clientIp = getClientIp(req);
            let localIp = getLocalIp();
            
            let publicIp = "Fetching public IP..."
            publicIp = await getPublicIp();
            const pool=await connection.connectDB();
            // if(status=='Inactive' || status=='inactive'){
                query=`Update [user] set status=@status where userId=@id`;
            // }
            // else{
                // query=`Update [user] set status='Active' where userId=@id`
            //}
            const result=await pool.request()
            .input('id',id).input('status',status).query(query);
            let query2='';
            // console.log("----------",result)
            if(status=='Inactive' || status=='inactive'){

                 query2=`Insert into audit_log(userID,operation,IP,token,status,newUserID) values(@userId,'delete user',@publicIp,@token,0,@newUserId)`
            }
            else{
                query2=`Insert into audit_log(userID,operation,IP,token,status,newUserID) values(@userId,'delete user',@publicIp,@token,1,@newUserId)`
            }

            await pool.request().
            input('userId',userId).input('publicIp',publicIp)
            .input('newUserId',newUserId).input('token',token).query(query2);
            return ;
        }
        catch(error){
            console.log("error in delete user service ",error.message)
        }
    },

    editUser: async function(req) {
        try {
            let userId = req.userId; // userId to identify which user to update
            let userName = req.name;
            let designationId = req.designation;
            let roleId = req.role;
            let email = req.email;
            let mobileNo = req.mobileNo;
            let updatedBy = req.updatedBy; // userId of the person making the update
            let businessVertical = req.associatedBusiness;
            let token = req.token;
            let status=req.status;
            let clientIp = getClientIp(req);
            let localIp = getLocalIp();
            
            let publicIp = "Fetching public IP...";
            publicIp = await getPublicIp();
            
            let pool = await connection.connectDB();
            
            // Update the user details in the database
            let query = `
                UPDATE [user]
                SET 
                    name = @userName, 
                    designationId = @designationId,
                    roleId = @roleId,
                    emailId = @email,
                    mobileNo = @mobileNo,
                    added_By=@updatedBy,
                    status=@status,
                    business_vertical = @businessVertical
                WHERE userId = @userId;
            `;
            
            let result = await pool.request()
                .input('userId', userId)
                .input('userName', userName)
                .input('designationId', designationId)
                .input('roleId', roleId)
                .input('email', email)
                .input('status',status)
                .input('updatedBy',updatedBy)
                .input('mobileNo', mobileNo)
                .input('password', password)
                .input('businessVertical', businessVertical)
                .query(query);
    
            //console.log("edit user result ", result);
    
            // Log the edit operation in Audit_log
            let query2 ='';
            if(status=='Active'){
                query2 = `
                    INSERT INTO Audit_log(userID, status, IP, token, newUserID, operation)
                    VALUES(@updatedBy, 1, @publicIp, @token, @userId, 'user edit');
                `;
            }
            else{
                query2 = `
                INSERT INTO Audit_log(userID, status, IP, token, newUserID, operation)
                VALUES(@updatedBy, 0, @publicIp, @token, @userId, 'user edit');
            `;
            }
            
            await pool.request()
                .input('updatedBy', updatedBy)
                .input('publicIp', publicIp)
                .input('token', token)
                .input('userId', userId)
                .query(query2);
    
            return result;
        } catch (error) {
            console.log("error in edit user service ", error.message);
            return error;
        }
    },
    
}
async function generatePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?';
    let password = '';
    
    while (password.length < length) {
        const randomValue = crypto.randomBytes(1)[0]; // Get a random byte
        const index = randomValue % charset.length;  // Map the byte to an index in the charset
        password += charset[index];
    }

    return password;
}