const express=require('express');
const router=express();
const brandController=require('../../controller/utilites/brand.controller');
const dealerController=require('../../controller/utilites/dealer.controller')
const locationController=require('../../controller/utilites/location.controller')

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
module.exports=router;