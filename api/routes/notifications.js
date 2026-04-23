const express = require('express');
const router = express.Router();
const Notifications = require('../db/models/Notifications');

// GET /api/notifications?userId=xxx
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
        res.json({ success: true, data: notifications, unreadCount, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/notifications/:id/read — Bildirimi okundu yap
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notifications.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() }, { new: true });
        if (!notification) return res.status(404).json({ success: false, error: 'Bildirim bulunamadı' });
        res.json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/notifications/read-all — Tüm bildirimleri okundu yap
router.put('/read-all/:userId', async (req, res) => {
    try {
        await Notifications.updateMany({ userId: req.params.userId, isRead: false }, { isRead: true, readAt: new Date() });
        res.json({ success: true, message: 'Tüm bildirimler okundu olarak işaretlendi' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/notifications
router.post('/', async (req, res) => {
    try {
        const notification = new Notifications(req.body);
        await notification.save();
        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
    try {
        const notification = await Notifications.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ success: false, error: 'Bildirim bulunamadı' });
        res.json({ success: true, message: 'Bildirim silindi' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
