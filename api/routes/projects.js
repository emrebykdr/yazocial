const express = require('express');
const router = express.Router();
const Projects = require('../db/models/Projects');
const ErrorCode = require('../lib/ErrorCode');
const SuccessCode = require('../lib/SuccessCode');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');
const { authenticate } = require('../middleware/auth');

// GET /api/projects
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = '-createdAt', status = 'active', tag, search } = req.query;
        const filter = { status };
        if (tag) filter.tags = tag;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }
        const projects = await Projects.find(filter)
            .populate('userId', 'username avatarUrl').populate('tags', 'name slug')
            .sort(sort).skip((page - 1) * limit).limit(parseInt(limit));
        const total = await Projects.countDocuments(filter);
        successResponse(res, { data: projects, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
    try {
        const project = await Projects.findById(req.params.id)
            .populate('userId', 'username avatarUrl').populate('tags', 'name slug');
        if (!project) return errorResponse(res, ErrorCode.PROJECT_NOT_FOUND);
        successResponse(res, { data: project });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

const TagHelper = require('../lib/TagHelper');

// POST /api/projects
router.post('/', authenticate, async (req, res) => {
    try {
        req.body.userId = req.user._id;

        // Hashtagleri ayıkla ve mevcut etiketlerle birleştir
        const titleTags = TagHelper.extractHashtags(req.body.title || '');
        const contentTags = TagHelper.extractHashtags(req.body.content || '');
        // Unique yap ve max 5 etiket sınırını koru
        const allTags = [...(req.body.tags || []), ...titleTags, ...contentTags];
        const uniqueTags = [...new Set(allTags.filter(t => typeof t === 'string').map(t => t.toLowerCase()))].slice(0, 5);
        req.body.tags = uniqueTags;

        // Etiketleri işle
        if (req.body.tags && Array.isArray(req.body.tags)) {
            req.body.tags = await TagHelper.syncTags(req.body.tags);
        }

        const project = new Projects(req.body);
        await project.save();
        successResponse(res, { statusCode: 201, ...SuccessCode.PROJECT_CREATED, data: project });
    } catch (error) {
        console.error('Project Creation Error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message).join(', ');
            return errorResponse(res, ErrorCode.VALIDATION_ERROR, messages);
        }
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// PUT /api/projects/:id
router.put('/:id', authenticate, async (req, res) => {
    try {
        const project = await Projects.findById(req.params.id);
        if (!project) return errorResponse(res, ErrorCode.PROJECT_NOT_FOUND);

        if (project.userId.toString() !== req.user._id.toString() && !['admin', 'moderator'].includes(req.user.role)) {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }

        const updatedProject = await Projects.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        successResponse(res, { ...SuccessCode.PROJECT_UPDATED, data: updatedProject });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// DELETE /api/projects/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const project = await Projects.findById(req.params.id);
        if (!project) return errorResponse(res, ErrorCode.PROJECT_NOT_FOUND);

        if (project.userId.toString() !== req.user._id.toString() && !['admin', 'moderator'].includes(req.user.role)) {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }

        await Projects.findByIdAndDelete(req.params.id);
        successResponse(res, SuccessCode.PROJECT_DELETED);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

module.exports = router;
