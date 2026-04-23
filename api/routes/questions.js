const express = require('express');
const router = express.Router();
const Questions = require('../db/models/Questions');

// GET /api/questions — Tüm soruları listele
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = '-createdAt', status, tag } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (tag) filter.tags = tag;

        const questions = await Questions.find(filter)
            .populate('userId', 'username avatarUrl reputation')
            .populate('tags', 'name slug')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const total = await Questions.countDocuments(filter);
        res.json({ success: true, data: questions, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/questions/:id — Tekil soru + view count artır
router.get('/:id', async (req, res) => {
    try {
        const question = await Questions.findByIdAndUpdate(
            req.params.id,
            { $inc: { viewCount: 1 } },
            { new: true }
        )
            .populate('userId', 'username avatarUrl reputation')
            .populate('tags', 'name slug')
            .populate('acceptedAnswerId');
        if (!question) return res.status(404).json({ success: false, error: 'Soru bulunamadı' });
        res.json({ success: true, data: question });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/questions — Yeni soru oluştur
router.post('/', async (req, res) => {
    try {
        const question = new Questions(req.body);
        await question.save();
        res.status(201).json({ success: true, data: question });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PUT /api/questions/:id — Soru güncelle
router.put('/:id', async (req, res) => {
    try {
        const question = await Questions.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!question) return res.status(404).json({ success: false, error: 'Soru bulunamadı' });
        res.json({ success: true, data: question });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// DELETE /api/questions/:id — Soru sil
router.delete('/:id', async (req, res) => {
    try {
        const question = await Questions.findByIdAndDelete(req.params.id);
        if (!question) return res.status(404).json({ success: false, error: 'Soru bulunamadı' });
        res.json({ success: true, message: 'Soru silindi' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/questions/:id/accept/:answerId — Cevabı kabul et
router.put('/:id/accept/:answerId', async (req, res) => {
    try {
        const question = await Questions.findByIdAndUpdate(
            req.params.id,
            { acceptedAnswerId: req.params.answerId },
            { new: true }
        );
        if (!question) return res.status(404).json({ success: false, error: 'Soru bulunamadı' });

        const Answers = require('../db/models/Answers');
        await Answers.updateMany({ questionId: req.params.id }, { isAccepted: false });
        await Answers.findByIdAndUpdate(req.params.answerId, { isAccepted: true });

        res.json({ success: true, data: question });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
