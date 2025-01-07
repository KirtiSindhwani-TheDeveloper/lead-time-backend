const express=require('express')
const leadTimeController=require('../../controller/lead-time/lead-time.controller')
const router=express();
router.post('/add-column',leadTimeController.addColumns);
router.post('/edit-column',leadTimeController.editColumns);
router.post('/fetch',leadTimeController.getRecords)
router.post('/export',leadTimeController.exportData)
router.post('/uploaded-data',leadTimeController.getUploadedData)
router.post('/export-multi',leadTimeController.exportMultiSheetData)
router.post('/upload',leadTimeController.uploadData)
router.post('/download-format',leadTimeController.downloadFormat)
router.post('/file-type',leadTimeController.getFileTypes)
router.post('/uploaded-logs',leadTimeController.getUploadLogs)
router.post('/read-sub-header',leadTimeController.readSubHeader)
router.post('/mapping-exist',leadTimeController.mappingExist)
router.post('/download-logs',leadTimeController.exportLogMultisheetData)
module.exports=router;