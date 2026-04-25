const express = require('express');
const router = express.Router();
const Posts = require('../db/models/Posts');
const PostComments = require('../db/models/PostComments');
const CommunityMembers = require('../db/models/CommunityMembers');
const { authenticate } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');
const ErrorCode = require('../lib/ErrorCode');

// GET /api/posts?communityId=xxx
router.get('/', async (req, res) => {
    try {
        const { communityId, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (communityId) filter.communityId = communityId;
        const posts = await Posts.find(filter)
            .populate('userId', 'username avatarUrl')
            .populate('communityId', 'name slug')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const total = await Posts.countDocuments(filter);
        successResponse(res, { data: posts, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
    try {
        const post = await Posts.findById(req.params.id)
            .populate('userId', 'username avatarUrl')
            .populate('communityId', 'name slug');
        if (!post) return errorResponse(res, ErrorCode.NOT_FOUND, 'Gönderi bulunamadı.');
        const comments = await PostComments.find({ postId: req.params.id, parentId: null })
            .populate('userId', 'username avatarUrl')
            .sort('createdAt');
        successResponse(res, { data: { ...post.toJSON(), comments } });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// POST /api/posts
router.post('/', authenticate, async (req, res) => {
    try {
        const { communityId, title, content } = req.body;
        const membership = await CommunityMembers.findOne({ communityId, userId: req.user._id });
        if (!membership) return errorResponse(res, ErrorCode.FORBIDDEN, 'Gönderi atmak için topluluğa katılın.');
        const post = new Posts({ communityId, title, content, userId: req.user._id });
        await post.save();
        await post.populate('userId', 'username avatarUrl');
        successResponse(res, { statusCode: 201, data: post });
    } catch (err) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, err.message);
    }
});

// DELETE /api/posts/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const post = await Posts.findById(req.params.id);
        if (!post) return errorResponse(res, ErrorCode.NOT_FOUND, 'Gönderi bulunamadı.');
        if (post.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }
        await Posts.findByIdAndDelete(req.params.id);
        await PostComments.deleteMany({ postId: req.params.id });
        successResponse(res, { message: 'Silindi.' });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// POST /api/posts/:id/comments
router.post('/:id/comments', authenticate, async (req, res) => {
    try {
        const post = await Posts.findById(req.params.id);
        if (!post) return errorResponse(res, ErrorCode.NOT_FOUND, 'Gönderi bulunamadı.');
        const { content, parentId } = req.body;
        const comment = new PostComments({ postId: req.params.id, userId: req.user._id, content, parentId: parentId || null });
        await comment.save();
        await comment.populate('userId', 'username avatarUrl');
        await Posts.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });
        successResponse(res, { statusCode: 201, data: comment });
    } catch (err) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, err.message);
    }
});

// DELETE /api/posts/:id/comments/:commentId
router.delete('/:id/comments/:commentId', authenticate, async (req, res) => {
    try {
        const comment = await PostComments.findById(req.params.commentId);
        if (!comment) return errorResponse(res, ErrorCode.NOT_FOUND, 'Yorum bulunamadı.');
        if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }
        await PostComments.findByIdAndDelete(req.params.commentId);
        await Posts.findByIdAndUpdate(req.params.id, { $inc: { commentCount: -1 } });
        successResponse(res, { message: 'Yorum silindi.' });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// POST /api/posts/:id/vote — upvote toggle
router.post('/:id/vote', authenticate, async (req, res) => {
    try {
        const { type = 'up' } = req.body;
        const post = await Posts.findById(req.params.id);
        if (!post) return errorResponse(res, ErrorCode.NOT_FOUND, 'Gönderi bulunamadı.');

        const Votes = require('../db/models/Votes');
        const existing = await Votes.findOne({ userId: req.user._id, postType: 'Posts', postId: req.params.id });
        let scoreChange = 0;

        if (existing) {
            if (existing.voteType === (type === 'up' ? 'Up' : 'Down')) {
                await Votes.findByIdAndDelete(existing._id);
                scoreChange = type === 'up' ? -1 : 1;
            } else {
                existing.voteType = type === 'up' ? 'Up' : 'Down';
                await existing.save();
                scoreChange = type === 'up' ? 2 : -2;
            }
        } else {
            await new Votes({ userId: req.user._id, postType: 'Posts', postId: req.params.id, voteType: type === 'up' ? 'Up' : 'Down' }).save();
            scoreChange = type === 'up' ? 1 : -1;
        }

        const updated = await Posts.findByIdAndUpdate(req.params.id, { $inc: { voteScore: scoreChange } }, { new: true });
        successResponse(res, { voteScore: updated.voteScore, scoreChange });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

// GET /api/posts/:id/comments
router.get('/:id/comments', async (req, res) => {
    try {
        const { page = 1, limit = 30 } = req.query;
        const comments = await PostComments.find({ postId: req.params.id, parentId: null })
            .populate('userId', 'username avatarUrl')
            .sort('createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const total = await PostComments.countDocuments({ postId: req.params.id, parentId: null });
        successResponse(res, { data: comments, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (err) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message);
    }
});

module.exports = router;
