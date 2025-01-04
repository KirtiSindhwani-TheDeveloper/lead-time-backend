const sql=require('mssql2');
const connection=require('../../connection');
const { RollbackTransactionEnvChangeToken } = require('tedious/lib/token/token');
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
            userName=req.name;
            designationId=req.designationId;
            roleId=req.roleId;
            email=req.email;
            
            const pool=await connection.connectDB();
            let query=`Insert [user] into values ()`;
            const result=await pool.request().query(query);
            // console.log("----------",result)
            return result;
        }
        catch(error){
            console.log("error in create user service ",error.message)
        }
    },

    allUsers:async function(req){
        try{
            const pool=await connection.connectDB();
            let query=`Select name ,userId from [user]`;
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
            const pool=await connection.connectDB();
            let query=`Select name ,userId from [user]`;
            const result=await pool.request().query(query);
            // console.log("----------",result)
            return result;
        }
        catch(error){
            console.log("error in delete user service ",error.message)
        }
    }
}