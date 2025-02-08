const sidebarService=require('../../services/sidebar/sidebar.service')
module.exports={
    getAllModules:async function(req,res){
        try{
            const result=await sidebarService.getAllModules(req);
            res.status(200).json({data:result});
        }
        catch(error){
            console.log("error in sidebar controller ",error)
            res.status(201).json({error:error.message});
        }
    }
}