const sql=require('mssql2');
const connection=require('../../connection')
module.exports={
    getAllModules:async function(req){

        try{
            const pool=await connection.connectDB();

            const result=await pool.request().query('Select * from module_master');

            return result;
        }
        catch(error){
            return error;
        }
    }
}