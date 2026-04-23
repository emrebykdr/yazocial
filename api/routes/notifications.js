const express = require('express');
const router = express.Router();
const Notifications = require('../db/models/Notifications');
const ErrorCode = require('../../lib/ErrorCode');
const SuccessCode = require('../../lib/SuccessCode');
const { successResponse, errorResponse } = require('../../lib/ResponseHelper');

// GET /api/notifications
router.get('/', async (req, res) => {
    try {
        const { userId, isRead, page = 1, limit = 30 } = req.query;
        const filter = {};
        if (userId) filter.userId = userId;
        if (isRead !== undefined) filter.isRead = isRead === 'true';
        const notifications = await Notifications.find(filter)
            .sort('-createdAt').skip((page - 1) * limit).limit(parseInt(limit));
        const total = await Notifications.countDocuments(filter);
        const unreadCount = userId ? await Notifications.countDocuments({ userId, isRead: false }) : 0;
        successResponse(res, { data: notifications, unreadCount, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notifications.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() }, { new: true });
        if (!notification) return errorResponse(res, ErrorCode.NOTIFICATION_NOT_FOUND);
        successResponse(res, SuccessCode.NOTIFICATION_READ);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// PUT /api/notifications/read-all/:userId
router.put('/read-all/:userId', async (req, res) => {
    try {
        await Notifications.updateMany({ userId: req.params.userId, isRead: false }, { isRead: true, readAt: new Date() });
        successResponse(res, SuccessCode.NOTIFICATIONS_READ_ALL);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// POST /api/notifications
router.post('/', async (req, res) => {
    try {
        const notification = new Notifications(req.body);
        await notification.save();
        successResponse(res, { statusCode: 201, data: notification });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
    try {
        const notification = await Notifications.findByIdAndDelete(req.params.id);
        if (!notification) return errorResponse(res, ErrorCode.NOTIFICATION_NOT_FOUND);
        successResponse(res, SuccessCode.NOTIFICATION_DELETED);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

module.exports = router;
