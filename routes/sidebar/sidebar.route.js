const express =require('express');
const router=express();
const sidebarController=require('../../controller/sidebar/sidebar.controller')
router.get('/module',sidebarController.getAllModules)
router.post('/modules-based-on-roles',sidebarController.getModulesBasedOnRoles)
module.exports=router;