const express = require('express');
const router = express.Router();
const Notifications = require('../db/models/Notifications');
const ErrorCode = require('../lib/ErrorCode');
const SuccessCode = require('../lib/SuccessCode');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');
const { authenticate } = require('../middleware/auth');
const SSEManager = require('../lib/SSEManager');

// GET /api/notifications/stream (SSE Uç Noktası)
router.get('/stream', authenticate, (req, res) => {
    // SSE için gerekli header'ları ayarla
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // İstemciye header'ları anında gönder

    // İstemciyi Manager'a ekle
    SSEManager.addClient(req.user._id, res);

    // Bağlantının koptuğunu anlamak için ufak bir ping at (isteğe bağlı)
    res.write(`event: connected\ndata: {"message": "SSE Bağlantısı Kuruldu", "userId": "${req.user._id}"}\n\n`);
});

// GET /api/notifications
router.get('/', authenticate, async (req, res) => {
    try {
        const { isRead, page = 1, limit = 30 } = req.query;
        const filter = { userId: req.user._id }; // Sadece kendi bildirimleri
        
        if (isRead !== undefined) filter.isRead = isRead === 'true';
        
        const notifications = await Notifications.find(filter)
            .sort('-createdAt').skip((page - 1) * limit).limit(parseInt(limit));
        const total = await Notifications.countDocuments(filter);
        const unreadCount = await Notifications.countDocuments({ userId: req.user._id, isRead: false });
        
        successResponse(res, { data: notifications, unreadCount, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        const notification = await Notifications.findById(req.params.id);
        if (!notification) return errorResponse(res, ErrorCode.NOTIFICATION_NOT_FOUND);

        if (notification.userId.toString() !== req.user._id.toString()) {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
        
        successResponse(res, SuccessCode.NOTIFICATION_READ);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, async (req, res) => {
    try {
        await Notifications.updateMany({ userId: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
        successResponse(res, SuccessCode.NOTIFICATIONS_READ_ALL);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// POST /api/notifications
router.post('/', authenticate, async (req, res) => {
    try {
        const notification = new Notifications(req.body);
        await notification.save();
        successResponse(res, { statusCode: 201, data: notification });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// DELETE /api/notifications/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const notification = await Notifications.findById(req.params.id);
        if (!notification) return errorResponse(res, ErrorCode.NOTIFICATION_NOT_FOUND);

        if (notification.userId.toString() !== req.user._id.toString()) {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }

        await Notifications.findByIdAndDelete(req.params.id);
        successResponse(res, SuccessCode.NOTIFICATION_DELETED);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

module.exports = router;
