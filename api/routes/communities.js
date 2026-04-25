const express = require('express');
const router = express.Router();
const Communities = require('../db/models/Communities');
const CommunityMembers = require('../db/models/CommunityMembers');
const { authenticate } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');
const ErrorCode = require('../lib/ErrorCode');

// GET /api/communities
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const filter = { isPublic: true };
        if (search) {
            const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.name = { $regex: safe, $options: 'i' };
        }
        const communities = await Communities.find(filter)
            .populate('ownerId', 'username')
            .sort('-memberCount')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const total = await Communities.countDocuments(filter);
        successResponse(res, { data: communities, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// GET /api/communities/my — giriş yapan kullanıcının üye olduğu topluluklar
router.get('/my', authenticate, async (req, res) => {
    try {
        const memberships = await CommunityMembers.find({ userId: req.user._id })
            .populate({ path: 'communityId', populate: { path: 'ownerId', select: 'username' } });
        const communities = memberships.map(m => m.communityId).filter(Boolean);
        successResponse(res, { data: communities });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// GET /api/communities/:id
router.get('/:id', async (req, res) => {
    try {
        const community = await Communities.findById(req.params.id).populate('ownerId', 'username avatarUrl');
        if (!community) return errorResponse(res, ErrorCode.NOT_FOUND, 'Topluluk bulunamadı.');
        successResponse(res, { data: community });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// POST /api/communities
router.post('/', authenticate, async (req, res) => {
    try {
        const { name, description, isPublic } = req.body;
        const community = new Communities({ name, description, isPublic, ownerId: req.user._id });
        await community.save();
        // Kurucu otomatik owner üyesi
        await new CommunityMembers({ communityId: community._id, userId: req.user._id, role: 'owner' }).save();
        successResponse(res, { statusCode: 201, data: community });
    } catch (err) {
        if (err.code === 11000) return errorResponse(res, ErrorCode.VALIDATION_ERROR, 'Bu isimde bir topluluk zaten var.');
        errorResponse(res, ErrorCode.VALIDATION_ERROR, err.message);
    }
});

// POST /api/communities/:id/join
router.post('/:id/join', authenticate, async (req, res) => {
    try {
        const community = await Communities.findById(req.params.id);
        if (!community) return errorResponse(res, ErrorCode.NOT_FOUND, 'Topluluk bulunamadı.');
        const exists = await CommunityMembers.findOne({ communityId: req.params.id, userId: req.user._id });
        if (exists) return errorResponse(res, ErrorCode.VALIDATION_ERROR, 'Zaten üyesiniz.');
        await new CommunityMembers({ communityId: req.params.id, userId: req.user._id }).save();
        await Communities.findByIdAndUpdate(req.params.id, { $inc: { memberCount: 1 } });
        successResponse(res, { message: 'Topluluğa katıldınız.' });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// DELETE /api/communities/:id/leave
router.delete('/:id/leave', authenticate, async (req, res) => {
    try {
        const membership = await CommunityMembers.findOne({ communityId: req.params.id, userId: req.user._id });
        if (!membership) return errorResponse(res, ErrorCode.NOT_FOUND, 'Üyelik bulunamadı.');
        if (membership.role === 'owner') return errorResponse(res, ErrorCode.VALIDATION_ERROR, 'Topluluk sahibi ayrılamaz.');
        await CommunityMembers.findByIdAndDelete(membership._id);
        await Communities.findByIdAndUpdate(req.params.id, { $inc: { memberCount: -1 } });
        successResponse(res, { message: 'Topluluktan ayrıldınız.' });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// GET /api/communities/:id/membership — üyelik durumunu kontrol et
router.get('/:id/membership', authenticate, async (req, res) => {
    try {
        const membership = await CommunityMembers.findOne({ communityId: req.params.id, userId: req.user._id });
        successResponse(res, { isMember: !!membership, role: membership?.role || null });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// GET /api/communities/:id/members
router.get('/:id/members', async (req, res) => {
    try {
        const { page = 1, limit = 30 } = req.query;
        const members = await CommunityMembers.find({ communityId: req.params.id })
            .populate('userId', 'username avatarUrl reputation bio')
            .sort({ role: 1, createdAt: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const total = await CommunityMembers.countDocuments({ communityId: req.params.id });
        successResponse(res, { data: members, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// GET /api/communities/:id/stats
router.get('/:id/stats', async (req, res) => {
    try {
        const Posts = require('../db/models/Posts');
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [totalPosts, weeklyPosts, memberCount] = await Promise.all([
            Posts.countDocuments({ communityId: req.params.id }),
            Posts.countDocuments({ communityId: req.params.id, createdAt: { $gte: weekAgo } }),
            CommunityMembers.countDocuments({ communityId: req.params.id }),
        ]);
        successResponse(res, { data: { totalPosts, weeklyPosts, memberCount } });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// PUT /api/communities/:id — topluluk güncelle (sadece owner)
router.put('/:id', authenticate, async (req, res) => {
    try {
        const community = await Communities.findById(req.params.id);
        if (!community) return errorResponse(res, ErrorCode.NOT_FOUND, 'Topluluk bulunamadı.');
        if (community.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }
        const { name, description, isPublic, icon, banner } = req.body;
        const updated = await Communities.findByIdAndUpdate(
            req.params.id,
            { name, description, isPublic, icon, banner },
            { new: true, runValidators: true }
        );
        successResponse(res, { data: updated });
    } catch (err) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, err.message);
    }
});

module.exports = router;
