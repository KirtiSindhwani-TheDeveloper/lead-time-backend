const express=require('express');
const router=express();
const roleAccessController=require('../../controller/role-based-access-management/role-based.controller')
router.post('/create',roleAccessController.createRole)

module.exports=router;