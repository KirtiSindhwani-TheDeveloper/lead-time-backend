const roleAccessService=require('../../services/role-based-access-management/role-based.service')
module.exports={

    createRole:async function (req,res){
        try{
            const result=await roleAccessService.createRole(req.body);
            res.status(200).json({message:'Role Created Successfully'})
        }
        catch(error){
            res.status(201).json({message:'Role is not able to create successfully',error:error.message })
        }
    }
}