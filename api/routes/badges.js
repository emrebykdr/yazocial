const express = require('express');
const router = express.Router();
const Badges = require('../db/models/Badges');
const UserBadges = require('../db/models/UserBadges');
const ErrorCode = require('../lib/ErrorCode');
const SuccessCode = require('../lib/SuccessCode');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');

// GET /api/badges
router.get('/', async (req, res) => {
    try {
        const badges = await Badges.find().sort('name');
        successResponse(res, { data: badges });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// GET /api/badges/:id
router.get('/:id', async (req, res) => {
    try {
        const badge = await Badges.findById(req.params.id);
        if (!badge) return errorResponse(res, ErrorCode.BADGE_NOT_FOUND);
        successResponse(res, { data: badge });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// POST /api/badges
router.post('/', async (req, res) => {
    try {
        const badge = new Badges(req.body);
        await badge.save();
        successResponse(res, { statusCode: 201, ...SuccessCode.BADGE_CREATED, data: badge });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// PUT /api/badges/:id
router.put('/:id', async (req, res) => {
    try {
        const badge = await Badges.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!badge) return errorResponse(res, ErrorCode.BADGE_NOT_FOUND);
        successResponse(res, { ...SuccessCode.BADGE_UPDATED, data: badge });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// DELETE /api/badges/:id
router.delete('/:id', async (req, res) => {
    try {
        const badge = await Badges.findByIdAndDelete(req.params.id);
        if (!badge) return errorResponse(res, ErrorCode.BADGE_NOT_FOUND);
        successResponse(res, SuccessCode.BADGE_DELETED);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// POST /api/badges/assign
router.post('/assign', async (req, res) => {
    try {
        const { userId, badgeId } = req.body;
        const userBadge = new UserBadges({ userId, badgeId });
        await userBadge.save();
        successResponse(res, { statusCode: 201, ...SuccessCode.BADGE_ASSIGNED, data: userBadge });
    } catch (error) {
        if (error.code === 11000) return errorResponse(res, ErrorCode.BADGE_ALREADY_ASSIGNED);
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// GET /api/badges/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const userBadges = await UserBadges.find({ userId: req.params.userId }).populate('badgeId');
        successResponse(res, { data: userBadges });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

module.exports = router;
