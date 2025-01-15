const express=require('express');
const router=express();
const brandController=require('../../controller/utilites/brand.controller');
const dealerController=require('../../controller/utilites/dealer.controller')
const locationController=require('../../controller/utilites/location.controller')
const utilitiesController=require('../../controller/utilites/utilities.controller')
/**
 * @swagger
 *  /api/utilities/brands:
 *  get:
 *     summary:This api is used to get all the brands
 * 
 */
router.get('/brands',brandController.getBrands)
router.post('/dealers',dealerController.getDealers)
router.post('/locations',locationController.getLocations)
router.post('/selected-locations',locationController.getLocationsBasedOnBrand)
router.get('/designations',utilitiesController.getDesignations)
router.get('/roles',utilitiesController.getRoles)
module.exports=router;