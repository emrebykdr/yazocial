const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');
const ErrorCode = require('../lib/ErrorCode');

// POST /api/upload — tek görsel yükleme
router.post('/', authenticate, (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) return errorResponse(res, ErrorCode.VALIDATION_ERROR, err.message);
        if (!req.file) return errorResponse(res, ErrorCode.VALIDATION_ERROR, 'Dosya seçilmedi.');

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        successResponse(res, { statusCode: 201, url: fileUrl, filename: req.file.filename });
    });
});

module.exports = router;
