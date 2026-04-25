const express = require('express');
const router = express.Router();
const Conversations = require('../db/models/Conversations');
const DirectMessages = require('../db/models/DirectMessages');
const { authenticate } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');
const ErrorCode = require('../lib/ErrorCode');

// GET /api/conversations — kullanıcının tüm sohbetleri
router.get('/', authenticate, async (req, res) => {
    try {
        const conversations = await Conversations.find({ participants: req.user._id })
            .populate('participants', 'username avatarUrl')
            .populate('lastSenderId', 'username')
            .sort('-lastMessageAt');
        successResponse(res, { data: conversations });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// POST /api/conversations — DM başlat (varsa getir, yoksa oluştur)
router.post('/', authenticate, async (req, res) => {
    try {
        const { targetUserId } = req.body;
        if (!targetUserId) return errorResponse(res, ErrorCode.VALIDATION_ERROR, 'targetUserId zorunlu.');
        if (targetUserId === req.user._id.toString()) return errorResponse(res, ErrorCode.VALIDATION_ERROR, 'Kendinize mesaj gönderemezsiniz.');

        const existing = await Conversations.findOne({
            participants: { $all: [req.user._id, targetUserId], $size: 2 }
        }).populate('participants', 'username avatarUrl');

        if (existing) return successResponse(res, { data: existing });

        const conversation = new Conversations({ participants: [req.user._id, targetUserId] });
        await conversation.save();
        await conversation.populate('participants', 'username avatarUrl');
        successResponse(res, { statusCode: 201, data: conversation });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// GET /api/conversations/:id/messages
router.get('/:id/messages', authenticate, async (req, res) => {
    try {
        const convo = await Conversations.findById(req.params.id);
        if (!convo) return errorResponse(res, ErrorCode.NOT_FOUND, 'Sohbet bulunamadı.');
        if (!convo.participants.some(p => p.toString() === req.user._id.toString())) {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }
        const { page = 1, limit = 50 } = req.query;
        const messages = await DirectMessages.find({ conversationId: req.params.id })
            .populate('senderId', 'username avatarUrl')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Okunmamışları oku
        await DirectMessages.updateMany(
            { conversationId: req.params.id, senderId: { $ne: req.user._id }, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        successResponse(res, { data: messages.reverse() });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// POST /api/conversations/:id/messages
router.post('/:id/messages', authenticate, async (req, res) => {
    try {
        const convo = await Conversations.findById(req.params.id);
        if (!convo) return errorResponse(res, ErrorCode.NOT_FOUND, 'Sohbet bulunamadı.');
        if (!convo.participants.some(p => p.toString() === req.user._id.toString())) {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }

        const message = new DirectMessages({
            conversationId: req.params.id,
            senderId: req.user._id,
            content: req.body.content
        });
        await message.save();
        await message.populate('senderId', 'username avatarUrl');

        await Conversations.findByIdAndUpdate(req.params.id, {
            lastMessage: req.body.content.substring(0, 100),
            lastMessageAt: new Date(),
            lastSenderId: req.user._id
        });

        // Socket.IO ile karşı tarafa emit et
        const io = req.app.get('io');
        if (io) {
            io.to(`dm:${req.params.id}`).emit('new_dm', message);
        }

        successResponse(res, { statusCode: 201, data: message });
    } catch (err) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, err.message);
    }
});

// GET /api/conversations/unread-count
router.get('/unread-count', authenticate, async (req, res) => {
    try {
        const convos = await Conversations.find({ participants: req.user._id });
        const convoIds = convos.map(c => c._id);
        const count = await DirectMessages.countDocuments({
            conversationId: { $in: convoIds },
            senderId: { $ne: req.user._id },
            isRead: false
        });
        successResponse(res, { count });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

module.exports = router;
