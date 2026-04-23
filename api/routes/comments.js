const express = require('express');
const router = express.Router();
const Comments = require('../db/models/Comments');
const ErrorCode = require('../lib/ErrorCode');
const SuccessCode = require('../lib/SuccessCode');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');

// GET /api/comments
router.get('/', async (req, res) => {
    try {
        const { postType, postId, parentId = null, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (postType) filter.postType = postType;
        if (postId) filter.postId = postId;
        filter.parentId = parentId;
        const comments = await Comments.find(filter)
            .populate('userId', 'username avatarUrl')
            .sort('createdAt').skip((page - 1) * limit).limit(parseInt(limit));
        const total = await Comments.countDocuments(filter);
        successResponse(res, { data: comments, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// GET /api/comments/:id/replies
router.get('/:id/replies', async (req, res) => {
    try {
        const replies = await Comments.find({ parentId: req.params.id })
            .populate('userId', 'username avatarUrl').sort('createdAt');
        successResponse(res, { data: replies });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// POST /api/comments
router.post('/', async (req, res) => {
    try {
        const comment = new Comments(req.body);
        await comment.save();
        const populated = await comment.populate('userId', 'username avatarUrl');
        successResponse(res, { statusCode: 201, ...SuccessCode.COMMENT_CREATED, data: populated });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// PUT /api/comments/:id
router.put('/:id', async (req, res) => {
    try {
        const comment = await Comments.findByIdAndUpdate(req.params.id, { ...req.body, isEdited: true }, { new: true, runValidators: true });
        if (!comment) return errorResponse(res, ErrorCode.COMMENT_NOT_FOUND);
        successResponse(res, { ...SuccessCode.COMMENT_UPDATED, data: comment });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// DELETE /api/comments/:id
router.delete('/:id', async (req, res) => {
    try {
        const comment = await Comments.findByIdAndDelete(req.params.id);
        if (!comment) return errorResponse(res, ErrorCode.COMMENT_NOT_FOUND);
        await Comments.deleteMany({ parentId: req.params.id });
        successResponse(res, SuccessCode.COMMENT_DELETED);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

module.exports = router;
