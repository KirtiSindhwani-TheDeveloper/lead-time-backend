const userService=require('../../services/user-management/user.service')
module.exports={
    getUsers:async function(req,res){
        try{
            const result=await userService.getUsers();
            // console.log("result ",result)
            
            return res.status(200).send({data:result})
        }
        catch(error){
            return res.status(201).send({error:error.message})
        }
    },

    createUser:async function(req,res){
        try{
            const result=await userService.createUser(req.body);
            return res.status(200).send({data:result})

        }catch(error){
            res.status(201).send({error:error.message})
        }
    },

    viewUser:async function(req,res){
        try{
            const result=await userService.allUsers(req.body);
            return res.status(200).send({data:result})

        }catch(error){
            res.status(201).send({error:error.message})
        }
    },

    deleteUser:async function(req,res){
        try{
            const result=await userService.deleteUser(req.body);
            return res.status(200).send({data:result})
        }
        catch(error){
            res.status(201).send({error:error.message})
        }
    }
}