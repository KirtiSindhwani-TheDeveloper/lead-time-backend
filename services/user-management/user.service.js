const sql=require('mssql2');
const connection=require('../../connection');
const { password } = require('../../dbConfig');
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
            let designationId=req.designation;
            let roleId=req.role;
            let email=req.email;
            let mobileNo=req.mobileNo;
            let password=req.password;
            let addedBy=req.userId;
            let businessVertical=req.associatedBusiness;
            let token=req.token;
            let clientIp = getClientIp(req);
            let localIp = getLocalIp();
            
            let publicIp = "Fetching public IP..."
            publicIp = await getPublicIp();
            let pool=await connection.connectDB();
            let query=`Insert into [user] (name,designationId,roleId,emailId,mobileNo,password,status,added_by,business_vertical) 
            OUTPUT INSERTED.userId   values (@userName,@designationId,@roleId,@email,@mobileNo,@password,'Active',@addedBy,@businessVertical)`;
            
            let result=await pool.request().input('userName',userName)
            .input('designationId',designationId).input('roleId',roleId)
            .input('email',email).input('mobileNo',mobileNo).input('password',password)
            .input('addedBy',addedBy).input('businessVertical',businessVertical)
            .query(query);
            console.log("create user result ",result)
            let insertedId=result[0].userId;
            const newUserIdFormatted = `SCS$${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${insertedId}`;
            console.log(newUserIdFormatted)
            let updateQuery = `
            UPDATE [user] SET newUserID = @newUserIdFormatted WHERE userId = @insertedId;
        `;
            await pool.request()
            .input('newUserIdFormatted', newUserIdFormatted)
            .input('insertedId', insertedId)
            .query(updateQuery);

            let query2=`Insert into  Audit_log(userID,status,
           IP,token,newUserID,operation)  values(@addedBy,1,@publicIp,@token,@newUserIdFormatted,'user creation')`;
            // console.log("----------",result)
            await pool.request().input('addedBy',addedBy)
            .input('publicIp',publicIp).input('token',token).input('newUserIdFormatted',newUserIdFormatted)
            .query(query2)
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
            let query=`Select name, roleId,designationId,business_vertical,emailId,mobileNo from [user] where status='Active'`;
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
            let userId=req.userId;
            const pool=await connection.connectDB();
            let query=`Update [user] set status='Inactive' where userId=@userId`;
            const result=await pool.request()
            .input('userId',userId).query(query);

            // console.log("----------",result)
            return result;
        }
        catch(error){
            console.log("error in delete user service ",error.message)
        }
    }
}