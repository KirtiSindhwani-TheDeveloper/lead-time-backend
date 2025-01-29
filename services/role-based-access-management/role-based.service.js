const sql=require('mssql2');
const connection=require('../../connection')
module.exports={

    createRole:async function(req){
        try{
            let userId=req.userId;
            let roleName=req.rolename;
            let GAINER=req.GAINER;
            let SIMS=req.SIMS;
            let AUDIT=req.AUDIT;
            let HR=req.HR;
            let OTHER=req.OTHERS;
            let IT=req.IT;

            // console.log(IT,SIMS,AUDIT,GAINER,OTHER,HR)
            const pool= await connection.connectDB();
            let query=`Insert into role_master(role_name,createdby,status
      ,SIMS
      ,AUDIT
      ,GAINER
      ,IT
      ,HR
      ,OTHER) values(@roleName,@userId,1,@SIMS,@AUDIT,@GAINER,@IT,@HR,@OTHER)`;

      await pool.request().input('roleName',roleName)
      .input('userId',userId).input('SIMS',SIMS).input('AUDIT',AUDIT).input('GAINER',GAINER).input('IT',IT).input('HR',HR).input('OTHER',OTHER)
      .query(query);
        }
        catch(error){
           console.log("error in role service ",error.message) 
        }
    }
}