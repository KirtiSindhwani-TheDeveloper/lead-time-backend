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
            res.status(200).json({message:'Role Created Successfully'})
        }
        catch(error){
            res.status(201).json({message:'Role is not able to create successfully',error:error.message })
        }
    },
    editRole:async function(req,res){
        try{
            const result=await roleAccessService.editRole(req.body,res);
            res.status(200).json({message:'Role Created Successfully'})
        }
        catch(error){
            res.status(201).json({message:'Role is not able to create successfully',error:error.message })
        }
    }

}