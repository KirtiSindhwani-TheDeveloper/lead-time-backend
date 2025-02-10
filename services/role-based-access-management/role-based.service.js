const sql=require('mssql2');
const connection=require('../../connection')
const { getLocalIp, getPublicIp, getClientIp } = require("../getIP");
const path=require('path');
const AdmZip = require('adm-zip');
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
            let token=req.token;
            let modules=req.modules;
            const pool= await connection.connectDB();
            const clientIp = getClientIp(req);
            const localIp = getLocalIp();
            
            let publicIp = "Fetching public IP..."
            publicIp = await getPublicIp();
            // console.log("public ip ", publicIp);
            //console.log("modules ",modules[0].submodules)
            for(let item of modules){

                for(let submodule of item.submodules){
                    // console.log(submodule)
                    let pageId=submodule.id;
                    let parentId=submodule.parentId;
                    let view1=submodule.view1;
                    let add1=submodule.add1;
                    let edit1=submodule.edit1;
                    let delete1=submodule.delete1;
                    let query=`Insert into role_master(role_name,createdby,status
                    ,SIMS
                    ,AUDIT
                    ,GAINER
                    ,IT
                    ,HR
                    ,OTHER,view1,edit,add1,delete1,moduleParentId,page_id) output inserted.id values(@roleName,@userId,1,@SIMS,@AUDIT,@GAINER,@IT,@HR,@OTHER,
                    @view1,@edit1,@add1,@delete1,@parentId,@pageId)`;
              
                    const result=await pool.request().input('roleName',roleName)
                    .input('userId',userId).input('SIMS',SIMS).input('AUDIT',AUDIT).input('GAINER',GAINER).input('IT',IT).input('HR',HR)
                    .input('OTHER',OTHER).input('view1',view1).input('edit1',edit1).input('add1',add1).input('delete1',delete1)
                    .input('parentId',parentId).input('pageId',pageId)
                    .query(query);
                     let insertedId=result[0].id;

                     //console.log("inseerted id ",result,insertedId)

                    
                    let query2=`Insert into Audit_log(roleName,userID,status
                    ,SIMS
                    ,AUDIT
                    ,GAINER
                    ,IT
                    ,HR
                    ,OTHERS,IP,token,operation,moduleParentId,pageId) values(@roleName,@userId,1,@SIMS,@AUDIT,@GAINER,@IT,@HR,@OTHER, @publicIp,@token,
                    'role creation',@parentId,@pageId)`;
              
                    await pool.request().input('roleName',roleName)
                    .input('userId',userId).input('SIMS',SIMS).input('AUDIT',AUDIT).input('GAINER',GAINER).input('IT',IT).input('HR',HR).input('OTHER',OTHER)
                    .input('publicIp',publicIp).input('token',token).input('parentId',parentId).input('pageId',pageId).query(query2);
                   let query3=`Insert into role_module_mapping(role_id,module_id) values(@insertedId,@pageId)`;

                   await pool.request().input('insertedId',insertedId).input('pageId',pageId).query(query3);
                }
            }
            // console.log(IT,SIMS,AUDIT,GAINER,OTHER,HR)
           
           
        }
        catch(error){
           console.log("error in role service ",error.message) ;
           //res.send({error:'error.message'});
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
            let modules=req.modules;

            console.log("modules",modules)
            
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

    },
    getAccessSettingsBasedOnRole:async function(req){
        try{

            const pool = await connection.connectDB();
            let vertical_ids = req.vertical_ids;
           // console.log("verticalid ", typeof vertical_ids[0]);
            
            // Ensure vertical_ids is an array of integers
            if (Array.isArray(vertical_ids) && vertical_ids.length > 0) {
                // Convert the array of ids to a comma-separated string
                const verticalIdsString = vertical_ids.join(',');
            
                const query = `SELECT * FROM module_master WHERE business_vertical_id IN (${verticalIdsString})`;
                const result = await pool.request().query(query);
                return result;
            } else {
                console.log("error in fucntion get access setting based on bvid")
            }
            
        }
        catch(error){
            console.log("errror in role service ",error.message)
            return error;
        }
    },

    getEditAccessSettingsBasedOnRole:async function(req){
        try{
            const pool = await connection.connectDB();
            let vertical_ids = req.vertical_ids;
            let roleId=req.roleId;
           // console.log("verticalid ", typeof vertical_ids[0]);
            
            // Ensure vertical_ids is an array of integers
            if (Array.isArray(vertical_ids) && vertical_ids.length > 0) {
                // Convert the array of ids to a comma-separated string
                const verticalIdsString = vertical_ids.join(',');
            
                const query = `SELECT * FROM module_master WHERE business_vertical_id IN (${verticalIdsString})`;
                const result1 = await pool.request().query(query);
                console.log("resul1 ",result1);
                    let query1 = `
                select mm.module_name, mm.parentId, rm.view1, rm.edit, rm.add1, rm.delete1
                from role_master rm
                join role_module_mapping rmm on rmm.role_id = rm.id
                join module_master mm on mm.id = rmm.module_id
                where mm.business_vertical_id in (${verticalIdsString})
                and rm.id = @roleId;
    `;

        const result =await pool.request()
            .input('roleId', roleId)
            .query(query1);
       // console.log("result",result)
        const mergedResult = result1.map(item1 => {
            const updatedItem = result.find(item2 => item2.module_name === item1.module_name);
          
            if (updatedItem) {
              return {
                ...item1,
                view1: updatedItem.view1 !== undefined ? updatedItem.view1 : false,
                edit1: updatedItem.edit !== undefined ? updatedItem.edit : false,
                add1: updatedItem.add1 !== undefined ? updatedItem.add1 : false,
                delete1: updatedItem.delete1 !== undefined ? updatedItem.delete1 : false
              };
            }
          
            return {
              ...item1,
              view1: false,
              edit1: false,
              add1: false,
              delete1: false
            };
          });
          
          //console.log(mergedResult);
          
         // console.log(mergedResult);
  return mergedResult;
            } else {
                console.log("error in function get access setting based on bvid")
            }
           
           
        }
        catch(error){
            console.log("errror in edit get access role service ",error.message)
            return error;
        }
    }
}