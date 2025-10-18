const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const supabase = require('../config/supabase');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed!'));
    }
  }
});

// Upload and process image (remove background)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    // Upload original image to Supabase Storage
    const originalFile = fs.readFileSync(filePath);
    const { data: originalUpload, error: originalError } = await supabase.storage
      .from('outfit-images')
      .upload(`original/${fileName}`, originalFile, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (originalError) {
      console.error('Error uploading original image:', originalError);
      throw originalError;
    }

    // Get public URL for original image
    const { data: { publicUrl: originalUrl } } = supabase.storage
      .from('outfit-images')
      .getPublicUrl(`original/${fileName}`);

    // Call background removal service
    let processedImageBuffer;

    // Check if using remove.bg API or local service
    const removeBgApiKey = process.env.REMOVEBG_API_KEY;

    if (removeBgApiKey) {
      // Use remove.bg API (higher quality)
      try {
        const formData = new FormData();
        formData.append('image_file', fs.createReadStream(filePath));
        formData.append('size', 'auto');

        const bgResponse = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
          headers: {
            ...formData.getHeaders(),
            'X-Api-Key': removeBgApiKey,
          },
          responseType: 'arraybuffer',
          timeout: 30000
        });

        processedImageBuffer = bgResponse.data;
        console.log('Background removed using remove.bg API');
      } catch (bgError) {
        console.error('remove.bg API error:', bgError.response?.data?.toString() || bgError.message);
        // If remove.bg fails, use original image
        processedImageBuffer = originalFile;
      }
    } else {
      // Use local Python service (free but lower quality)
      try {
        const removeBgUrl = process.env.REMOVE_BG_API_URL || 'http://localhost:5001';
        const formData = new FormData();
        formData.append('image', fs.createReadStream(filePath));

        const bgResponse = await axios.post(`${removeBgUrl}/remove-bg`, formData, {
          headers: formData.getHeaders(),
          responseType: 'arraybuffer',
          timeout: 30000
        });
        processedImageBuffer = bgResponse.data;
        console.log('Background removed using local service');
      } catch (bgError) {
        console.error('Background removal service error:', bgError.message);
        // If bg removal fails, use original image
        processedImageBuffer = originalFile;
      }
    }

    // Upload processed image to Supabase Storage
    const processedFileName = `processed-${fileName}`;
    const { data: processedUpload, error: processedError } = await supabase.storage
      .from('outfit-images')
      .upload(`processed/${processedFileName}`, processedImageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (processedError) {
      console.error('Error uploading processed image:', processedError);
      throw processedError;
    }

    // Get public URL for processed image
    const { data: { publicUrl: processedUrl } } = supabase.storage
      .from('outfit-images')
      .getPublicUrl(`processed/${processedFileName}`);

    // Clean up local file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      originalUrl,
      processedUrl,
      fileName: processedFileName
    });

  } catch (error) {
    console.error('Upload error:', error);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: 'Failed to process image',
      message: error.message
    });
  }
});

module.exports = router;
