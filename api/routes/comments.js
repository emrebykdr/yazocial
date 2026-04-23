const express = require('express');
const router = express.Router();
const Comments = require('../db/models/Comments');

// GET /api/comments?postType=Questions&postId=xxx — Posta ait yorumları listele
router.get('/', async (req, res) => {
    try {
        const { postType, postId, parentId = null, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (postType) filter.postType = postType;
        if (postId) filter.postId = postId;
        filter.parentId = parentId; // null = root comments, id = thread replies

        const comments = await Comments.find(filter)
            .populate('userId', 'username avatarUrl')
            .sort('createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const total = await Comments.countDocuments(filter);
        res.json({ success: true, data: comments, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/comments/:id/replies — Bir yorumun thread yanıtları
router.get('/:id/replies', async (req, res) => {
    try {
        const replies = await Comments.find({ parentId: req.params.id })
            .populate('userId', 'username avatarUrl')
            .sort('createdAt');
        res.json({ success: true, data: replies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/comments — Yeni yorum oluştur
router.post('/', async (req, res) => {
    try {
        const comment = new Comments(req.body);
        await comment.save();
        const populated = await comment.populate('userId', 'username avatarUrl');
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PUT /api/comments/:id — Yorum güncelle
router.put('/:id', async (req, res) => {
    try {
        const comment = await Comments.findByIdAndUpdate(
            req.params.id,
            { ...req.body, isEdited: true },
            { new: true, runValidators: true }
        );
        if (!comment) return res.status(404).json({ success: false, error: 'Yorum bulunamadı' });
        res.json({ success: true, data: comment });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// DELETE /api/comments/:id — Yorum sil
router.delete('/:id', async (req, res) => {
    try {
        const comment = await Comments.findByIdAndDelete(req.params.id);
        if (!comment) return res.status(404).json({ success: false, error: 'Yorum bulunamadı' });
        // Alt yorumları da sil (thread)
        await Comments.deleteMany({ parentId: req.params.id });
        res.json({ success: true, message: 'Yorum ve yanıtları silindi' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
