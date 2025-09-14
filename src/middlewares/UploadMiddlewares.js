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
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = {
    uploadSingle: upload.single('coverImage'),
    uploadMultiple: upload.array('chapterImages', 50) // tối đa 50 ảnh cho chapter
};