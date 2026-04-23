const express = require('express');
const router = express.Router();
const Answers = require('../db/models/Answers');

// GET /api/answers?questionId=xxx — Soruya ait cevapları listele
router.get('/', async (req, res) => {
    try {
        const { questionId, page = 1, limit = 20, sort = '-voteScore' } = req.query;
        const filter = {};
        if (questionId) filter.questionId = questionId;

        const answers = await Answers.find(filter)
            .populate('userId', 'username avatarUrl reputation')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const total = await Answers.countDocuments(filter);
        res.json({ success: true, data: answers, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/answers/:id — Tekil cevap
router.get('/:id', async (req, res) => {
    try {
        const answer = await Answers.findById(req.params.id)
            .populate('userId', 'username avatarUrl reputation')
            .populate('questionId', 'title slug');
        if (!answer) return res.status(404).json({ success: false, error: 'Cevap bulunamadı' });
        res.json({ success: true, data: answer });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/answers — Yeni cevap oluştur
router.post('/', async (req, res) => {
    try {
        const answer = new Answers(req.body);
        await answer.save();

        // Sorunun answerCount'unu artır
        const Questions = require('../db/models/Questions');
        await Questions.findByIdAndUpdate(req.body.questionId, { $inc: { answerCount: 1 } });

        res.status(201).json({ success: true, data: answer });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PUT /api/answers/:id — Cevap güncelle
router.put('/:id', async (req, res) => {
    try {
        const answer = await Answers.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!answer) return res.status(404).json({ success: false, error: 'Cevap bulunamadı' });
        res.json({ success: true, data: answer });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// DELETE /api/answers/:id — Cevap sil
router.delete('/:id', async (req, res) => {
    try {
        const answer = await Answers.findByIdAndDelete(req.params.id);
        if (!answer) return res.status(404).json({ success: false, error: 'Cevap bulunamadı' });

        // Sorunun answerCount'unu azalt
        const Questions = require('../db/models/Questions');
        await Questions.findByIdAndUpdate(answer.questionId, { $inc: { answerCount: -1 } });

        res.json({ success: true, message: 'Cevap silindi' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
