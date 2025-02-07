const sql=require('mssql2');
const connection=require('../../connection')
const { getLocalIp, getPublicIp, getClientIp } = require("../getIP");
const path=require('path');
const AdmZip = require('adm-zip');
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

            let query=`Select id,role_name as name,sims,hr,audit,gainer,it,other,status from role_master `;

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
    },

    deleteRole:async function(req,res){
         try{
                    let userId=req.loginUserId;
                    let id=req.id;
                    //console.log(req,id)
                    let status=req.status;
                    let token=req.token;
                    let query='';
                    let clientIp = getClientIp(req);
                    let localIp = getLocalIp();
                    
                    let publicIp = "Fetching public IP..."
                    publicIp = await getPublicIp();
                    const pool=await connection.connectDB();
                    if(req.status=='Active')
                    {
                        status=1;
                    }
                    else{
                        status=0
                    }
                    // if(status=='Inactive' || status=='inactive'){
                        query=`Update role_master set status=@status where id=@id`;
                    // }
                    // else{
                        // query=`Update [user] set status='Active' where userId=@id`
                    //}
                    const result=await pool.request()
                    .input('id',id).input('status',status).query(query);
                    let query2='';
                    // console.log("----------",result)
                    if(status=='Inactive' || status=='inactive'){
        
                         query2=`Insert into audit_log(userID,operation,IP,token,status) values(@userId,'delete user',@publicIp,@token,0)`
                    }
                    else{
                        query2=`Insert into audit_log(userID,operation,IP,token,status) values(@userId,'delete user',@publicIp,@token,1)`
                    }
        
                    await pool.request().
                    input('userId',userId).input('publicIp',publicIp)
                    .input('token',token).query(query2);
                    return ;
                }
                catch(error){
                    console.log("error in delete user service ",error.message)
                }
    },
    
    downloadRoleFormat:async function (req) {
        
        try{
             const baseFolderPath = path.join(__dirname);
             let filePaths ;
             filePaths=path.join(baseFolderPath, 'Role-Access-Format', '');
              const zip = new AdmZip();
              zip.addLocalFile(filePaths);
        }
        catch(error){

        }
    },
    uploadRoleFormat:async function(req){

    }
}