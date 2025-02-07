const roleAccessService=require('../../services/role-based-access-management/role-based.service')
module.exports={

    createRole:async function (req,res){
        try{
            const result=await roleAccessService.createRole(req.body,res);
            res.status(200).json({message:'Role Created Successfully'})
        }
        catch(error){
            res.status(201).json({message:'Role is not able to create successfully',error:error.message })
        }
    },
    viewRole:async function(req,res){
        try{
            const result=await roleAccessService.viewRole(req.body,res);
            res.status(200).json({data:result})
        }
        catch(error){
            res.status(201).json({message:'Role is not able to view successfully',error:error.message })
        }
    },
    editRole:async function(req,res){
        try{
            const result=await roleAccessService.editRole(req.body,res);
            res.status(200).json({message:'Role Updated Successfully'})
        }
        catch(error){
            res.status(201).json({message:'Role is not able to update successfully',error:error.message })
        }
    },
    deleteRole:async function(req,res){
        try{
            const result=await roleAccessService.deleteRole(req.body,res);
            res.status(200).json({message:'Role Delete Successfully'})
        }
        catch(error){
            res.status(201).json({message:'Role is not able to delete successfully',error:error.message })
        }
    },
    downloadRoleFormat:async function(req,res) {
        try{
            const result=await roleAccessService.downloadRoleFormat(req);
              res.send(result);
        }
        catch(error){
            res.status(201).json({message:'Unable to download Role Format',error:error.message })
        }
    },
    uploadRoleFormat:async function(req,res){
        try{
            const result=await roleAccessService.uploadRoleFormat(req.body,res);
            res.status(200).json({message:'Role uploaded Successfully'})
        }
        catch(error){
            res.status(201).json({message:'Unable to upload Format',error:error.message })
        }
    }

}