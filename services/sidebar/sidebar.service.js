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
    },

    getModulesBasedOnRoles:async function(req){
        try{
            const pool=await connection.connectDB();

            let roleId=req.roleId;
            let query=`select distinct (mm.module_name),mm.isActive,mm.parentModuleName,mm.module_route,
            rmm.view1,rmm.edit1,rmm.add1,rmm.delete1 from module_master mm join role_module_mapping rmm on  rmm.module_id=mm.id   where rmm.role_id=@roleId order by mm.parentModuleName`;

            const result=await pool.request().input('roleId',roleId).query(query);
        

            return result;
        }
        catch(error){
            return error;
        }
    }
}