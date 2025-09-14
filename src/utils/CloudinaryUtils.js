const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

class CloudinaryUtils {
    // Upload single image from buffer
    async uploadImage(buffer, folder = 'manga', fileName = null) {
        try {
            return new Promise((resolve, reject) => {
                const uploadOptions = {
                    resource_type: 'image',
                    folder: folder,
                    quality: 'auto',
                    fetch_format: 'auto'
                };

                if (fileName) {
                    uploadOptions.public_id = fileName;
                }

                const uploadStream = cloudinary.uploader.upload_stream(
                    uploadOptions,
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );

                // Convert buffer to stream and pipe to Cloudinary
                const bufferStream = new Readable();
                bufferStream.push(buffer);
                bufferStream.push(null);
                bufferStream.pipe(uploadStream);
            });
        } catch (error) {
            throw new Error('Failed to upload image: ' + error.message);
        }
    }

    // Upload multiple images (for chapters)
    async uploadMultipleImages(buffers, folder = 'manga/chapters') {
        try {
            const uploadPromises = buffers.map((buffer, index) => 
                this.uploadImage(buffer, folder, `page_${index + 1}`)
            );
            return await Promise.all(uploadPromises);
        } catch (error) {
            throw new Error('Failed to upload multiple images: ' + error.message);
        }
    }

    // Delete image from Cloudinary
    async deleteImage(publicId) {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (error) {
            throw new Error('Failed to delete image: ' + error.message);
        }
    }
}

module.exports = new CloudinaryUtils();