const express = require('express');
const router = express.Router();
const Badges = require('../db/models/Badges');
const UserBadges = require('../db/models/UserBadges');
const ErrorCode = require('../lib/ErrorCode');
const SuccessCode = require('../lib/SuccessCode');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');
const { authenticate, authorize } = require('../middleware/auth');
const SSEManager = require('../lib/SSEManager');
const Notifications = require('../db/models/Notifications');

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
router.post('/', authenticate, authorize('admin', 'moderator'), async (req, res) => {
    try {
        const badge = new Badges(req.body);
        await badge.save();
        successResponse(res, { statusCode: 201, ...SuccessCode.BADGE_CREATED, data: badge });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// PUT /api/badges/:id
router.put('/:id', authenticate, authorize('admin', 'moderator'), async (req, res) => {
    try {
        const badge = await Badges.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!badge) return errorResponse(res, ErrorCode.BADGE_NOT_FOUND);
        successResponse(res, { ...SuccessCode.BADGE_UPDATED, data: badge });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// DELETE /api/badges/:id
router.delete('/:id', authenticate, authorize('admin', 'moderator'), async (req, res) => {
    try {
        const badge = await Badges.findByIdAndDelete(req.params.id);
        if (!badge) return errorResponse(res, ErrorCode.BADGE_NOT_FOUND);
        successResponse(res, SuccessCode.BADGE_DELETED);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// POST /api/badges/assign
router.post('/assign', authenticate, authorize('admin', 'moderator'), async (req, res) => {
    try {
        const { userId, badgeId } = req.body;
        const userBadge = new UserBadges({ userId, badgeId });
        await userBadge.save();

        // --- BİLDİRİM OLUŞTURMA VE GÖNDERME ---
        try {
            const badge = await Badges.findById(badgeId);
            const notification = new Notifications({
                userId: userId,
                type: 'badge_earned',
                message: `Tebrikler! '${badge ? badge.name : 'Yeni'}' rozetini kazandınız.`,
                relatedId: badgeId,
                relatedModel: 'Badges'
            });
            await notification.save();
            
            // SSE ile anlık gönder
            SSEManager.sendToUser(userId, 'new_notification', notification);
        } catch (notifErr) {
            console.error('Rozet bildirimi hatası:', notifErr);
        }

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
