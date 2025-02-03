const sql=require('mssql2');
const connection=require('../../connection')
const { getLocalIp, getPublicIp, getClientIp } = require("../getIP");
module.exports={

    createRole:async function(req,res){
        try{

            let userId=req.userId;
            let roleName=req.rolename;
            let GAINER=req.GAINER;
            let SIMS=req.SIMS;
            let AUDIT=req.AUDIT;
            let HR=req.HR;
            let OTHER=req.OTHERS;
            let IT=req.IT;
            let token=req.token;
            // console.log(IT,SIMS,AUDIT,GAINER,OTHER,HR)
            const pool= await connection.connectDB();
            const clientIp = getClientIp(req);
            const localIp = getLocalIp();
            
            let publicIp = "Fetching public IP..."
            publicIp = await getPublicIp();
            // console.log("public ip ", publicIp);
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

      let query2=`Insert into Audit_log(roleName,userID,status
      ,SIMS
      ,AUDIT
      ,GAINER
      ,IT
      ,HR
      ,OTHERS,IP,token,operation) values(@roleName,@userId,1,@SIMS,@AUDIT,@GAINER,@IT,@HR,@OTHER, @publicIp,@token,'role creation')`;

      await pool.request().input('roleName',roleName)
      .input('userId',userId).input('SIMS',SIMS).input('AUDIT',AUDIT).input('GAINER',GAINER).input('IT',IT).input('HR',HR).input('OTHER',OTHER)
      .input('publicIp',publicIp).input('token',token).query(query2);
        }
        catch(error){
           //console.log("error in role service ",error.message) ;
           res.send({error:'error.message'});
        }
    },

    viewRole:async function(req,res){
        try{
            const pool=await connection.connectDB();

            let query=`Select id,role_name as name,sims,hr,audit,gainer,it,other from role_master where status=1`;

            let result=await pool.request().query(query);

            return result;

        }
        catch(error){
            console.log("error in  role service for view ",error.message)
            return error;
        }
    },
    editRole:async function(req,res){
        try{
            let id=req.id;
            let userId=req.userId;
            let roleName=req.name;
            let GAINER=req.gainer;
            let SIMS=req.sims;
            let AUDIT=req.audit;
            let HR=req.hr;
            let OTHER=req.others;
            let IT=req.it;
            let token=req.token;

            
            if(!GAINER){
                GAINER=false;
            }
            if( !SIMS ){
                SIMS=false;
            }
            if(!AUDIT ){
                AUDIT=false;
            }
            if(!HR ){
                HR=false;
            }
            if(!OTHER){
                OTHER=false;
            }
            if(!IT){
                IT=false;
            }
            //console.log("role ",OTHER,GAINER,HR,IT,AUDIT,SIMS)
           // let status=req.status;
            // console.log(IT,SIMS,AUDIT,GAINER,OTHER,HR)
            const pool= await connection.connectDB();
            const clientIp = getClientIp(req);
            const localIp = getLocalIp();
            
            let publicIp = "Fetching public IP..."
            publicIp = await getPublicIp();
            // console.log("public ip ", publicIp);
            let query = `UPDATE role_master 
             SET role_name = @roleName, 
                 createdby = @userId, 
                 status = 1,
                 SIMS = @SIMS, 
                 AUDIT = @AUDIT, 
                 GAINER = @GAINER, 
                 IT = @IT, 
                 HR = @HR, 
                 OTHER = @OTHER
                
             WHERE id = @id`;
            // status=@status
      await pool.request().input('roleName',roleName)
      .input('userId',userId).input('SIMS',SIMS).input('AUDIT',AUDIT).input('GAINER',GAINER).input('IT',IT).input('HR',HR).input('OTHER',OTHER)
      .input('id',id).query(query);
    //   .input('status',status)
      let query2=`Insert into Audit_log(roleName,userID,status
      ,SIMS
      ,AUDIT
      ,GAINER
      ,IT
      ,HR
      ,OTHERS,IP,token,operation) values(@roleName,@userId,1,@SIMS,@AUDIT,@GAINER,@IT,@HR,@OTHER, @publicIp,@token,'update role')`;

      await pool.request().input('roleName',roleName)
      .input('userId',userId).input('SIMS',SIMS).input('AUDIT',AUDIT).input('GAINER',GAINER).input('IT',IT).input('HR',HR).input('OTHER',OTHER)
      .input('publicIp',publicIp).input('token',token).query(query2);
        }
        catch(error){
           //console.log("error in role service ",error.message) ;
           res.send({error:'error.message',error});
        }
    }
}