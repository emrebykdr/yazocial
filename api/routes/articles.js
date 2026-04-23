const express = require('express');
const router = express.Router();
const Articles = require('../db/models/Articles');

// GET /api/articles
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = '-createdAt', status = 'published', tag } = req.query;
        const filter = { status };
        if (tag) filter.tags = tag;
        const articles = await Articles.find(filter)
            .populate('userId', 'username avatarUrl')
            .populate('tags', 'name slug')
            .sort(sort).skip((page - 1) * limit).limit(parseInt(limit));
        const total = await Articles.countDocuments(filter);
        res.json({ success: true, data: articles, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/articles/:id
router.get('/:id', async (req, res) => {
    try {
        const article = await Articles.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }, { new: true })
            .populate('userId', 'username avatarUrl').populate('tags', 'name slug');
        if (!article) return res.status(404).json({ success: false, error: 'Makale bulunamadı' });
        res.json({ success: true, data: article });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/articles
router.post('/', async (req, res) => {
    try {
        const article = new Articles(req.body);
        await article.save();
        res.status(201).json({ success: true, data: article });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PUT /api/articles/:id
router.put('/:id', async (req, res) => {
    try {
        const article = await Articles.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!article) return res.status(404).json({ success: false, error: 'Makale bulunamadı' });
        res.json({ success: true, data: article });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// DELETE /api/articles/:id
router.delete('/:id', async (req, res) => {
    try {
        const article = await Articles.findByIdAndDelete(req.params.id);
        if (!article) return res.status(404).json({ success: false, error: 'Makale bulunamadı' });
        res.json({ success: true, message: 'Makale silindi' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
