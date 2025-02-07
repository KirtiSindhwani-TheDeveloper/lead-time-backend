const express=require('express');
const router=express();
const roleAccessController=require('../../controller/role-based-access-management/role-based.controller')
const uploadsDir = './role-access-settings-upload';
const multer=require('multer');
const fs=require('fs')
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
router.post('/create',roleAccessController.createRole)
router.get('/view',roleAccessController.viewRole)
router.post('/edit',roleAccessController.editRole)
router.post('/delete',roleAccessController.deleteRole)
router.get('/download-role-format',roleAccessController.downloadRoleFormat)
router.get('/upload-role',upload.single('excelFile'),roleAccessController.uploadRoleFormat)
module.exports=router;