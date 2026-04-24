const express = require('express');
const router = express.Router();
const Users = require('../db/models/Users');
const ErrorCode = require('../lib/ErrorCode');
const SuccessCode = require('../lib/SuccessCode');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/users
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = '-createdAt', search } = req.query;
        const filter = { isActive: true };
        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const users = await Users.find(filter)
            .sort(sort).skip((page - 1) * limit).limit(parseInt(limit));
        const total = await Users.countDocuments(filter);
        successResponse(res, { data: users, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// GET /api/users/profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id || req.user._id);
        if (!user) return errorResponse(res, ErrorCode.USER_NOT_FOUND);
        successResponse(res, { data: user });
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

// POST /api/users (Admin tarafından manuel kullanıcı ekleme)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
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
router.put('/:id', authenticate, async (req, res) => {
    try {
        if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }

        // Normal kullanıcılar kendi yetkilerini (role, reputation vb.) güncelleyememeli
        if (req.user.role !== 'admin') {
            delete req.body.role;
            delete req.body.reputation;
            delete req.body.level;
            delete req.body.isActive;
        }

        const user = await Users.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!user) return errorResponse(res, ErrorCode.USER_NOT_FOUND);
        successResponse(res, { ...SuccessCode.USER_UPDATED, data: user });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// DELETE /api/users/:id (soft delete)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const user = await Users.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!user) return errorResponse(res, ErrorCode.USER_NOT_FOUND);
        successResponse(res, SuccessCode.USER_DEACTIVATED);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

module.exports = router;
