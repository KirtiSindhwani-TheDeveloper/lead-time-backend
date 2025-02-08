const express =require('express');
const router=express();
const sidebarController=require('../../controller/sidebar/sidebar.controller')
router.get('/module',sidebarController.getAllModules)

module.exports=router;