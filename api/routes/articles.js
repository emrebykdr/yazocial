const express = require('express');
const router = express.Router();
const Articles = require('../db/models/Articles');
const ErrorCode = require('../lib/ErrorCode');
const SuccessCode = require('../lib/SuccessCode');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');
const { authenticate } = require('../middleware/auth');

// GET /api/articles
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = '-createdAt', status = 'published', tag } = req.query;
        const filter = { status };
        if (tag) filter.tags = tag;
        const articles = await Articles.find(filter)
            .populate('userId', 'username avatarUrl').populate('tags', 'name slug')
            .sort(sort).skip((page - 1) * limit).limit(parseInt(limit));
        const total = await Articles.countDocuments(filter);
        successResponse(res, { data: articles, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// GET /api/articles/:id
router.get('/:id', async (req, res) => {
    try {
        const article = await Articles.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }, { new: true })
            .populate('userId', 'username avatarUrl').populate('tags', 'name slug');
        if (!article) return errorResponse(res, ErrorCode.ARTICLE_NOT_FOUND);
        successResponse(res, { data: article });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// POST /api/articles
router.post('/', authenticate, async (req, res) => {
    try {
        req.body.userId = req.user._id;
        const article = new Articles(req.body);
        await article.save();
        successResponse(res, { statusCode: 201, ...SuccessCode.ARTICLE_CREATED, data: article });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// PUT /api/articles/:id
router.put('/:id', authenticate, async (req, res) => {
    try {
        const article = await Articles.findById(req.params.id);
        if (!article) return errorResponse(res, ErrorCode.ARTICLE_NOT_FOUND);

        if (article.userId.toString() !== req.user._id.toString() && !['admin', 'moderator'].includes(req.user.role)) {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }

        const updatedArticle = await Articles.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        successResponse(res, { ...SuccessCode.ARTICLE_UPDATED, data: updatedArticle });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// DELETE /api/articles/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const article = await Articles.findById(req.params.id);
        if (!article) return errorResponse(res, ErrorCode.ARTICLE_NOT_FOUND);

        if (article.userId.toString() !== req.user._id.toString() && !['admin', 'moderator'].includes(req.user.role)) {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }

        await Articles.findByIdAndDelete(req.params.id);
        successResponse(res, SuccessCode.ARTICLE_DELETED);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

module.exports = router;
