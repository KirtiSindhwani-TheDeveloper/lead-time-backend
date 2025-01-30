const express=require('express');
const router=express();
const roleAccessController=require('../../controller/role-based-access-management/role-based.controller')
router.post('/create',roleAccessController.createRole)
router.get('/view',roleAccessController.viewRole)
router.post('/edit',roleAccessController.editRole)
module.exports=router;