const express = require('express');
const router = express.Router();
const Questions = require('../db/models/Questions');
const ErrorCode = require('../lib/ErrorCode');
const SuccessCode = require('../lib/SuccessCode');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');
const questionsValidation = require('../validations/questions.validation');

// GET /api/questions
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = '-createdAt', status, tag, search } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (tag) filter.tags = tag;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }
        const questions = await Questions.find(filter)
            .populate('userId', 'username avatarUrl reputation')
            .populate('tags', 'name slug')
            .sort(sort).skip((page - 1) * limit).limit(parseInt(limit));
        const total = await Questions.countDocuments(filter);
        successResponse(res, { data: questions, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// GET /api/questions/:id
router.get('/:id', async (req, res) => {
    try {
        const question = await Questions.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }, { new: true })
            .populate('userId', 'username avatarUrl reputation')
            .populate('tags', 'name slug')
            .populate('acceptedAnswerId')
            .populate({
                path: 'answers',
                populate: { path: 'userId', select: 'username avatarUrl reputation' }
            });
        if (!question) return errorResponse(res, ErrorCode.QUESTION_NOT_FOUND);
        successResponse(res, { data: question });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

const TagHelper = require('../lib/TagHelper');

// POST /api/questions
router.post('/', authenticate, validate(questionsValidation.create), async (req, res) => {
    try {
        req.body.userId = req.user._id; // Zorunlu sahiplik
        
        // BUG 5 FIX: Frontend zaten birleşik tag listesini gönderiyor.
        // Backend'de tekrar hashtag çıkarmak gereksiz DB sorgusuna yol açıyordu.
        // Sadece string kontrolü yapıp doğrudan syncTags'e gönderiyoruz.
        const incomingTags = Array.isArray(req.body.tags)
            ? req.body.tags.filter(t => typeof t === 'string').slice(0, 5)
            : [];

        // Tag isimlerini ObjectId'ye çevir, yoksa oluştur
        req.body.tags = await TagHelper.syncTags(incomingTags);

        const question = new Questions(req.body);
        await question.save();
        successResponse(res, { statusCode: 201, ...SuccessCode.QUESTION_CREATED, data: question });
    } catch (error) {
        console.error('Question Creation Error:', error);
        // BUG 3 FIX: Hata tipine göre doğru HTTP kodu döndür.
        // Mongoose ValidationError → 400, diğerleri → 500
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message).join(', ');
            return errorResponse(res, ErrorCode.VALIDATION_ERROR, messages);
        }
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// PUT /api/questions/:id
router.put('/:id', authenticate, validate(questionsValidation.update), async (req, res) => {
    try {
        const question = await Questions.findById(req.params.id);
        if (!question) return errorResponse(res, ErrorCode.QUESTION_NOT_FOUND);
        
        // Sahiplik kontrolü
        if (question.userId.toString() !== req.user._id.toString() && !['admin', 'moderator'].includes(req.user.role)) {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }

        const updatedQuestion = await Questions.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        successResponse(res, { ...SuccessCode.QUESTION_UPDATED, data: updatedQuestion });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// DELETE /api/questions/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const question = await Questions.findById(req.params.id);
        if (!question) return errorResponse(res, ErrorCode.QUESTION_NOT_FOUND);

        if (question.userId.toString() !== req.user._id.toString() && !['admin', 'moderator'].includes(req.user.role)) {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }

        await Questions.findByIdAndDelete(req.params.id);
        successResponse(res, SuccessCode.QUESTION_DELETED);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// PUT /api/questions/:id/accept/:answerId
router.put('/:id/accept/:answerId', authenticate, async (req, res) => {
    try {
        const question = await Questions.findById(req.params.id);
        if (!question) return errorResponse(res, ErrorCode.QUESTION_NOT_FOUND);

        // Sadece soruyu soran kişi veya admin cevap kabul edebilir
        if (question.userId.toString() !== req.user._id.toString() && !['admin', 'moderator'].includes(req.user.role)) {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }

        question.acceptedAnswerId = req.params.answerId;
        await question.save();

        const Answers = require('../db/models/Answers');
        await Answers.updateMany({ questionId: req.params.id }, { isAccepted: false });
        await Answers.findByIdAndUpdate(req.params.answerId, { isAccepted: true });
        
        successResponse(res, { ...SuccessCode.ANSWER_ACCEPTED, data: question });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

module.exports = router;
