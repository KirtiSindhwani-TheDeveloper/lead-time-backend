
const utilitiesService=require('../../services/utilites/utilities.service')
module.exports={
    getDesignations:async function(req,res){
        try{
      const result=await utilitiesService.getDesignations(req);
       res.send({status:200,data:result})
        }
        catch(error){
    res.send(201).json({error:error.message});
        }

    },
    getRoles:async function(req,res){
        try{
            const result=await utilitiesService.getRoles(req);
            res.send({status:200,data:result})
        }
        catch(error){
            res.send(201).json({error:error.message})
        }
    },
    getBusinessVertical:async function(req,res){
        try{
            const result=await utilitiesService.getBusinessVertical(req);
            res.send({status:200,data:result})
        }
        catch(error){
            res.send(201).json({error:error.message})
        }
    }
}