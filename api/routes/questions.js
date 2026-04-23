const express = require('express');
const router = express.Router();
const Questions = require('../db/models/Questions');
const ErrorCode = require('../../lib/ErrorCode');
const SuccessCode = require('../../lib/SuccessCode');
const { successResponse, errorResponse } = require('../../lib/ResponseHelper');

// GET /api/questions
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = '-createdAt', status, tag } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (tag) filter.tags = tag;
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
            .populate('tags', 'name slug').populate('acceptedAnswerId');
        if (!question) return errorResponse(res, ErrorCode.QUESTION_NOT_FOUND);
        successResponse(res, { data: question });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// POST /api/questions
router.post('/', async (req, res) => {
    try {
        const question = new Questions(req.body);
        await question.save();
        successResponse(res, { statusCode: 201, ...SuccessCode.QUESTION_CREATED, data: question });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// PUT /api/questions/:id
router.put('/:id', async (req, res) => {
    try {
        const question = await Questions.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!question) return errorResponse(res, ErrorCode.QUESTION_NOT_FOUND);
        successResponse(res, { ...SuccessCode.QUESTION_UPDATED, data: question });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// DELETE /api/questions/:id
router.delete('/:id', async (req, res) => {
    try {
        const question = await Questions.findByIdAndDelete(req.params.id);
        if (!question) return errorResponse(res, ErrorCode.QUESTION_NOT_FOUND);
        successResponse(res, SuccessCode.QUESTION_DELETED);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// PUT /api/questions/:id/accept/:answerId
router.put('/:id/accept/:answerId', async (req, res) => {
    try {
        const question = await Questions.findByIdAndUpdate(req.params.id, { acceptedAnswerId: req.params.answerId }, { new: true });
        if (!question) return errorResponse(res, ErrorCode.QUESTION_NOT_FOUND);
        const Answers = require('../db/models/Answers');
        await Answers.updateMany({ questionId: req.params.id }, { isAccepted: false });
        await Answers.findByIdAndUpdate(req.params.answerId, { isAccepted: true });
        successResponse(res, { ...SuccessCode.ANSWER_ACCEPTED, data: question });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

module.exports = router;
