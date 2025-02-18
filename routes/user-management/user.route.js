const express=require('express')
const userController=require('../../controller/user-management/user.controller');
const router=express();

router.get('/get-user',userController.getUsers);
router.post('/create-user',userController.createUser)
router.get('/view-user',userController.viewUser)
router.post('/delete-user',userController.deleteUser);
router.post('/edit-user',userController.editUser);
router.post('/request-new-mail',userController.requestNewMail)
module.exports=router