const express = require('express');
const router = express.Router();
const Follows = require('../db/models/Follows');
const ErrorCode = require('../lib/ErrorCode');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');

// POST /api/follows — toggle
router.post('/', async (req, res) => {
    try {
        const { followerId, followingId } = req.body;
        const existing = await Follows.findOne({ followerId, followingId });
        if (existing) {
            await Follows.findByIdAndDelete(existing._id);
            return successResponse(res, ErrorCode.UNFOLLOWED);
        }
        const follow = new Follows({ followerId, followingId });
        await follow.save();
        successResponse(res, { statusCode: 201, ...ErrorCode.FOLLOWED });
    } catch (error) {
        if (error.message.includes('kendini takip')) return errorResponse(res, ErrorCode.FOLLOW_SELF);
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// GET /api/follows/:userId/followers
router.get('/:userId/followers', async (req, res) => {
    try {
        const followers = await Follows.find({ followingId: req.params.userId })
            .populate('followerId', 'username avatarUrl reputation');
        successResponse(res, { data: followers, count: followers.length });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// GET /api/follows/:userId/following
router.get('/:userId/following', async (req, res) => {
    try {
        const following = await Follows.find({ followerId: req.params.userId })
            .populate('followingId', 'username avatarUrl reputation');
        successResponse(res, { data: following, count: following.length });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// GET /api/follows/check
router.get('/check', async (req, res) => {
    try {
        const { followerId, followingId } = req.query;
        const exists = await Follows.findOne({ followerId, followingId });
        successResponse(res, { data: { isFollowing: !!exists } });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

module.exports = router;
