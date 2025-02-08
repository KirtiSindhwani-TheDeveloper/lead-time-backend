const connection=require('../../connection')
module.exports={
    getDesignations:async function(req){
        try{
            let pool=await connection.connectDB();
            let query=`Select id,designation_name from designation_master`;

           let result= await pool.request().query(query);
            return result;

        }
        catch(error){
            return error;
        }
    },

    getRoles:async function(req){
        try{
            let pool=await connection.connectDB();
            let query=`Select id,role_name from role_master where status=1`;
           let result= await pool.request().query(query);
            return result;

        }
        catch(error){
            return error;
        }
    },

    getBusinessVertical:async function(req){
        try{
            let pool=await connection.connectDB();
            let query=`SELECT id,business_vertical from business_vertical_master`;

           let result= await pool.request().query(query);
            return result;

        }
        catch(error){
            return error;
        }
    }

}