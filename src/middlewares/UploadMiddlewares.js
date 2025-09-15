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
        fileSize: 20 * 1024 * 1024 // 20MB limit
    }
});

module.exports = {
    uploadSingle: upload.single('coverImage'),
    uploadMultiple: upload.array('pages', 100) // tối đa 100 ảnh cho chapter
};