const express=require('express')
const userController=require('../../controller/user-management/user.controller');
const userService = require('../../services/user-management/user.service');
const router=express();

router.get('/get-user',userController.getUsers);
router.post('/create-user',userController.createUser)
router.post('/view-user',userController.viewUser)
router.post('/delete-user',userController.deleteUser)
module.exports=router