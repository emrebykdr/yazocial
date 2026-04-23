const express = require('express');
const router = express.Router();
const Projects = require('../db/models/Projects');
const ErrorCode = require('../../lib/ErrorCode');
const SuccessCode = require('../../lib/SuccessCode');
const { successResponse, errorResponse } = require('../../lib/ResponseHelper');

// GET /api/projects
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = '-createdAt', status = 'active', tag } = req.query;
        const filter = { status };
        if (tag) filter.tags = tag;
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

// POST /api/projects
router.post('/', async (req, res) => {
    try {
        const project = new Projects(req.body);
        await project.save();
        successResponse(res, { statusCode: 201, ...SuccessCode.PROJECT_CREATED, data: project });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
    try {
        const project = await Projects.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!project) return errorResponse(res, ErrorCode.PROJECT_NOT_FOUND);
        successResponse(res, { ...SuccessCode.PROJECT_UPDATED, data: project });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
    try {
        const project = await Projects.findByIdAndDelete(req.params.id);
        if (!project) return errorResponse(res, ErrorCode.PROJECT_NOT_FOUND);
        successResponse(res, SuccessCode.PROJECT_DELETED);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

module.exports = router;
