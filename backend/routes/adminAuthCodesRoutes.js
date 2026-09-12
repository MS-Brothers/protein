const express = require('express');
const router = express.Router();
const multer = require('multer');
const { adminProtect } = require('../middleware/adminAuthMiddleware');
const { 
  uploadExcel,
  getExcelUploads,
  getExcelUploadById,
  deleteExcelUpload,
  clearAllAuthCodes,
  getExcelUploadCodes,
  markLabelUsed
} = require('../controllers/adminAuthCodesController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files are allowed.'));
    }
  }
});

// POST /api/admin/auth-codes/upload
router.post('/upload', adminProtect, upload.single('excelFile'), uploadExcel);

// DELETE /api/admin/auth-codes/clear-all
router.delete('/clear-all', adminProtect, clearAllAuthCodes);

// GET /api/admin/excel-uploads
router.get('/excel-uploads', adminProtect, getExcelUploads);

// GET /api/admin/excel-uploads/:id
router.get('/excel-uploads/:id', adminProtect, getExcelUploadById);

// GET /api/admin/excel-uploads/:uploadId/codes
router.get('/excel-uploads/:uploadId/codes', adminProtect, getExcelUploadCodes);

// DELETE /api/admin/excel-uploads/:id
router.delete('/excel-uploads/:id', adminProtect, deleteExcelUpload);

// POST /api/admin/auth-codes/:codeStr/label-used
router.post('/:codeStr/label-used', adminProtect, markLabelUsed);

// Error handler for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

module.exports = router;
