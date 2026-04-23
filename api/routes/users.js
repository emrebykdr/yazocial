const express = require('express');
const router = express.Router();
const Users = require('../db/models/Users');

// GET /api/users — Tüm kullanıcıları listele
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
        const users = await Users.find({ isActive: true })
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const total = await Users.countDocuments({ isActive: true });
        res.json({ success: true, data: users, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/users/:id — Tekil kullanıcı
router.get('/:id', async (req, res) => {
    try {
        const user = await Users.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/users — Yeni kullanıcı oluştur
router.post('/', async (req, res) => {
    try {
        const user = new Users(req.body);
        await user.save();
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PUT /api/users/:id — Kullanıcı güncelle
router.put('/:id', async (req, res) => {
    try {
        const user = await Users.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// DELETE /api/users/:id — Kullanıcı sil (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const user = await Users.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
        res.json({ success: true, message: 'Kullanıcı deaktif edildi' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
