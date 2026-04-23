const express = require('express');
const router = express.Router();
const Comments = require('../db/models/Comments');
const ErrorCode = require('../lib/ErrorCode');
const SuccessCode = require('../lib/SuccessCode');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');
const { authenticate } = require('../middleware/auth');
const SSEManager = require('../lib/SSEManager');
const Notifications = require('../db/models/Notifications');
const mongoose = require('mongoose');

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
router.post('/', authenticate, async (req, res) => {
    try {
        req.body.userId = req.user._id;
        const comment = new Comments(req.body);
        await comment.save();
        const populated = await comment.populate('userId', 'username avatarUrl');

        // --- BİLDİRİM OLUŞTURMA VE GÖNDERME ---
        try {
            // parentModel (Questions, Answers, Articles) importu ve sorgusu
            const ParentModel = mongoose.model(req.body.postType);
            const parentDoc = await ParentModel.findById(req.body.postId);

            if (parentDoc && parentDoc.userId.toString() !== req.user._id.toString()) {
                const notification = new Notifications({
                    userId: parentDoc.userId,
                    type: 'new_comment',
                    message: `${req.user.username} içeriğinize yorum yaptı.`,
                    relatedId: req.body.postId,
                    relatedModel: req.body.postType
                });
                await notification.save();
                
                // SSE ile anlık gönder
                SSEManager.sendToUser(parentDoc.userId, 'new_notification', notification);
            }
        } catch (notifErr) {
            console.error('Yorum bildirimi hatası:', notifErr);
        }

        successResponse(res, { statusCode: 201, ...SuccessCode.COMMENT_CREATED, data: populated });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// PUT /api/comments/:id
router.put('/:id', authenticate, async (req, res) => {
    try {
        const comment = await Comments.findById(req.params.id);
        if (!comment) return errorResponse(res, ErrorCode.COMMENT_NOT_FOUND);

        if (comment.userId.toString() !== req.user._id.toString() && !['admin', 'moderator'].includes(req.user.role)) {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }

        const updatedComment = await Comments.findByIdAndUpdate(req.params.id, { ...req.body, isEdited: true }, { new: true, runValidators: true });
        successResponse(res, { ...SuccessCode.COMMENT_UPDATED, data: updatedComment });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// DELETE /api/comments/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const comment = await Comments.findById(req.params.id);
        if (!comment) return errorResponse(res, ErrorCode.COMMENT_NOT_FOUND);

        if (comment.userId.toString() !== req.user._id.toString() && !['admin', 'moderator'].includes(req.user.role)) {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }

        await Comments.findByIdAndDelete(req.params.id);
        await Comments.deleteMany({ parentId: req.params.id });
        successResponse(res, SuccessCode.COMMENT_DELETED);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

module.exports = router;
