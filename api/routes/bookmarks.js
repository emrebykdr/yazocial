const express = require('express');
const router = express.Router();
const Bookmarks = require('../db/models/Bookmarks');
const { authenticate } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');
const ErrorCode = require('../lib/ErrorCode');

// POST /api/bookmarks — toggle (ekle veya kaldır)
router.post('/', authenticate, async (req, res) => {
    try {
        const { postId, postType } = req.body;
        if (!postId || !postType) return errorResponse(res, ErrorCode.VALIDATION_ERROR, 'postId ve postType zorunludur.');

        const existing = await Bookmarks.findOne({ userId: req.user._id, postId, postType });
        if (existing) {
            await Bookmarks.findByIdAndDelete(existing._id);
            return successResponse(res, { message: 'Kayıt kaldırıldı.', bookmarked: false });
        }

        const bookmark = new Bookmarks({ userId: req.user._id, postId, postType });
        await bookmark.save();
        successResponse(res, { statusCode: 201, message: 'Kaydedildi.', bookmarked: true, data: bookmark });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// GET /api/bookmarks — giriş yapan kullanıcının bookmark'ları
router.get('/', authenticate, async (req, res) => {
    try {
        const { page = 1, limit = 20, postType } = req.query;
        const filter = { userId: req.user._id };
        if (postType) filter.postType = postType;

        const bookmarks = await Bookmarks.find(filter)
            .populate({ path: 'postId', select: 'title slug content createdAt userId', populate: { path: 'userId', select: 'username' } })
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Bookmarks.countDocuments(filter);
        successResponse(res, { data: bookmarks, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// GET /api/bookmarks/check?postId=xxx&postType=xxx — bookmark durumunu sorgula
router.get('/check', authenticate, async (req, res) => {
    try {
        const { postId, postType } = req.query;
        const exists = await Bookmarks.exists({ userId: req.user._id, postId, postType });
        successResponse(res, { bookmarked: !!exists });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// DELETE /api/bookmarks/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const bookmark = await Bookmarks.findById(req.params.id);
        if (!bookmark) return errorResponse(res, ErrorCode.NOT_FOUND, 'Bookmark bulunamadı.');
        if (bookmark.userId.toString() !== req.user._id.toString()) return errorResponse(res, ErrorCode.FORBIDDEN);
        await Bookmarks.findByIdAndDelete(req.params.id);
        successResponse(res, { message: 'Silindi.' });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

module.exports = router;
