const express=require('express');
const router=express();
const fs=require('fs');
const multer=require('multer')
const mappingController=require('../../controller/mapping/mapping.controller')
const uploadsDir = './mapping-uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
// console.log("storage ",storage)
const upload = multer({ storage: storage });
// console.log("upload",upload)
router.post('/upload',upload.single('excelFile'),mappingController.uploadFile);
router.post('/mapped-column',mappingController.mappedColumns)
module.exports=router;