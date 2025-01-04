const locationService=require('../../services/utilites/location.service')
module.exports={
    getLocations:async function(req,res){
        try{
            const result=await locationService.getLocations(req.body);
            return res.json({status:200,data:result});
        }
        catch(error)
        {
            res.json({error:"Dealers are not fetched",status:500})
        }
    },

    getLocationsBasedOnBrand:async function (req,res) {
        try{
            const result=await locationService.getLocationsBasedOnBrand(req.body);
            return res.json({status:200,data:result});
        }
        catch(error)
        {
            res.json({error:"Dealers are not fetched",status:500})
        }
    }
}