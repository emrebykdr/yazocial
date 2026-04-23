const express = require('express');
const router = express.Router();
const Users = require('../db/models/Users');
const ErrorCode = require('../lib/ErrorCode');
const SuccessCode = require('../lib/SuccessCode');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');

// GET /api/users
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
        const users = await Users.find({ isActive: true })
            .sort(sort).skip((page - 1) * limit).limit(parseInt(limit));
        const total = await Users.countDocuments({ isActive: true });
        successResponse(res, { data: users, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
    try {
        const user = await Users.findById(req.params.id);
        if (!user) return errorResponse(res, ErrorCode.USER_NOT_FOUND);
        successResponse(res, { data: user });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// POST /api/users
router.post('/', async (req, res) => {
    try {
        const user = new Users(req.body);
        await user.save();
        successResponse(res, { statusCode: 201, ...SuccessCode.USER_CREATED, data: user });
    } catch (error) {
        if (error.code === 11000) return errorResponse(res, ErrorCode.USER_ALREADY_EXISTS);
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
    try {
        const user = await Users.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!user) return errorResponse(res, ErrorCode.USER_NOT_FOUND);
        successResponse(res, { ...SuccessCode.USER_UPDATED, data: user });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// DELETE /api/users/:id (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const user = await Users.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!user) return errorResponse(res, ErrorCode.USER_NOT_FOUND);
        successResponse(res, SuccessCode.USER_DEACTIVATED);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

module.exports = router;
