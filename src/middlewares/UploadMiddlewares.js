const multer = require('multer');

// Cấu hình multer để lưu file trong memory
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Chỉ cho phép upload image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB limit per file
    }
});

module.exports = {
    uploadSingle: upload.single('coverImage'),
    
    // Middleware cho chapter upload (thumbnail + pages)
    uploadChapterFiles: upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'pages', maxCount: 100 }
    ]),
    
    // Deprecated - kept for backward compatibility
    uploadThumbnail: upload.single('thumbnail'),
    uploadMultiple: upload.array('pages', 100)
};