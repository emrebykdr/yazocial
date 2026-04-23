const express = require('express');
const router = express.Router();
const Tags = require('../db/models/Tags');

// GET /api/tags — Tüm tag'leri listele
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        const filter = {};
        if (search) filter.name = { $regex: search, $options: 'i' };

        const tags = await Tags.find(filter).sort('name');
        res.json({ success: true, data: tags });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/tags/:id — Tekil tag
router.get('/:id', async (req, res) => {
    try {
        const tag = await Tags.findById(req.params.id);
        if (!tag) return res.status(404).json({ success: false, error: 'Tag bulunamadı' });
        res.json({ success: true, data: tag });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/tags — Yeni tag oluştur
router.post('/', async (req, res) => {
    try {
        const tag = new Tags(req.body);
        await tag.save();
        res.status(201).json({ success: true, data: tag });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PUT /api/tags/:id — Tag güncelle
router.put('/:id', async (req, res) => {
    try {
        const tag = await Tags.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!tag) return res.status(404).json({ success: false, error: 'Tag bulunamadı' });
        res.json({ success: true, data: tag });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// DELETE /api/tags/:id — Tag sil
router.delete('/:id', async (req, res) => {
    try {
        const tag = await Tags.findByIdAndDelete(req.params.id);
        if (!tag) return res.status(404).json({ success: false, error: 'Tag bulunamadı' });
        res.json({ success: true, message: 'Tag silindi' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
