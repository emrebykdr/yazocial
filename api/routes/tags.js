const express = require('express');
const router = express.Router();
const Tags = require('../db/models/Tags');
const ErrorCode = require('../lib/ErrorCode');
const SuccessCode = require('../lib/SuccessCode');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/tags
router.get('/', async (req, res) => {
    try {
        const { search, limit = 10, sort = '-usageCount' } = req.query;
        const filter = {};
        if (search) filter.name = { $regex: search, $options: 'i' };
        const tags = await Tags.find(filter).sort(sort).limit(parseInt(limit));
        successResponse(res, { data: tags });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// GET /api/tags/:id
router.get('/:id', async (req, res) => {
    try {
        const tag = await Tags.findById(req.params.id);
        if (!tag) return errorResponse(res, ErrorCode.TAG_NOT_FOUND);
        successResponse(res, { data: tag });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// POST /api/tags
router.post('/', authenticate, authorize('admin', 'moderator'), async (req, res) => {
    try {
        const tag = new Tags(req.body);
        await tag.save();
        successResponse(res, { statusCode: 201, ...SuccessCode.TAG_CREATED, data: tag });
    } catch (error) {
        if (error.code === 11000) return errorResponse(res, ErrorCode.TAG_ALREADY_EXISTS);
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// PUT /api/tags/:id
router.put('/:id', authenticate, authorize('admin', 'moderator'), async (req, res) => {
    try {
        const tag = await Tags.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!tag) return errorResponse(res, ErrorCode.TAG_NOT_FOUND);
        successResponse(res, { ...SuccessCode.TAG_UPDATED, data: tag });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// DELETE /api/tags/:id
router.delete('/:id', authenticate, authorize('admin', 'moderator'), async (req, res) => {
    try {
        const tag = await Tags.findByIdAndDelete(req.params.id);
        if (!tag) return errorResponse(res, ErrorCode.TAG_NOT_FOUND);
        successResponse(res, SuccessCode.TAG_DELETED);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

module.exports = router;
