const express = require('express');
const router = express.Router();
const Follows = require('../db/models/Follows');

// POST /api/follows — Takip et / Takibi bırak (toggle)
router.post('/', async (req, res) => {
    try {
        const { followerId, followingId } = req.body;
        const existing = await Follows.findOne({ followerId, followingId });
        if (existing) {
            await Follows.findByIdAndDelete(existing._id);
            return res.json({ success: true, message: 'Takip bırakıldı', action: 'unfollowed' });
        }
        const follow = new Follows({ followerId, followingId });
        await follow.save();
        res.status(201).json({ success: true, message: 'Takip edildi', action: 'followed' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// GET /api/follows/:userId/followers — Takipçiler
router.get('/:userId/followers', async (req, res) => {
    try {
        const followers = await Follows.find({ followingId: req.params.userId })
            .populate('followerId', 'username avatarUrl reputation');
        res.json({ success: true, data: followers, count: followers.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/follows/:userId/following — Takip edilenler
router.get('/:userId/following', async (req, res) => {
    try {
        const following = await Follows.find({ followerId: req.params.userId })
            .populate('followingId', 'username avatarUrl reputation');
        res.json({ success: true, data: following, count: following.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/follows/check?followerId=x&followingId=y — Takip durumu kontrol
router.get('/check', async (req, res) => {
    try {
        const { followerId, followingId } = req.query;
        const exists = await Follows.findOne({ followerId, followingId });
        res.json({ success: true, isFollowing: !!exists });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
