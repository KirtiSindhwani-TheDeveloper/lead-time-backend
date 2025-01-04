const brandService=require('../../services/utilites/brand.service')
module.exports={
    getBrands:async function(req,res){
        try{
            const result=await brandService.getBrands();
            return res.json({status:200,data:result});
        }
        catch(error)
        {
            res.json({error:"Brands are not fetched",status:500})
        }
    }
}