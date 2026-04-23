const express = require('express');
const router = express.Router();
const Badges = require('../db/models/Badges');
const UserBadges = require('../db/models/UserBadges');

// GET /api/badges — Tüm rozetleri listele
router.get('/', async (req, res) => {
    try {
        const badges = await Badges.find().sort('name');
        res.json({ success: true, data: badges });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/badges/:id
router.get('/:id', async (req, res) => {
    try {
        const badge = await Badges.findById(req.params.id);
        if (!badge) return res.status(404).json({ success: false, error: 'Rozet bulunamadı' });
        res.json({ success: true, data: badge });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/badges
router.post('/', async (req, res) => {
    try {
        const badge = new Badges(req.body);
        await badge.save();
        res.status(201).json({ success: true, data: badge });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PUT /api/badges/:id
router.put('/:id', async (req, res) => {
    try {
        const badge = await Badges.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!badge) return res.status(404).json({ success: false, error: 'Rozet bulunamadı' });
        res.json({ success: true, data: badge });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// DELETE /api/badges/:id
router.delete('/:id', async (req, res) => {
    try {
        const badge = await Badges.findByIdAndDelete(req.params.id);
        if (!badge) return res.status(404).json({ success: false, error: 'Rozet bulunamadı' });
        res.json({ success: true, message: 'Rozet silindi' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/badges/assign — Kullanıcıya rozet ata
router.post('/assign', async (req, res) => {
    try {
        const { userId, badgeId } = req.body;
        const userBadge = new UserBadges({ userId, badgeId });
        await userBadge.save();
        res.status(201).json({ success: true, data: userBadge });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// GET /api/badges/user/:userId — Kullanıcının rozetleri
router.get('/user/:userId', async (req, res) => {
    try {
        const userBadges = await UserBadges.find({ userId: req.params.userId })
            .populate('badgeId');
        res.json({ success: true, data: userBadges });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
