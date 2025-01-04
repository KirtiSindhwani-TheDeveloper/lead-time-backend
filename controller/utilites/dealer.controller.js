const dealerService=require('../../services/utilites/dealer.service')
module.exports={
    getDealers:async function(req,res){

        try{
            const result=await dealerService.getDealersBasedOnBrandID(req.body);
            return res.json({status:200,data:result});
        }
        catch(error)
        {
            res.json({error:"Dealers are not fetched",status:500})
        }
    }
}