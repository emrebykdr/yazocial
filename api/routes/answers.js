const express = require('express');
const router = express.Router();
const Answers = require('../db/models/Answers');
const ErrorCode = require('../lib/ErrorCode');
const SuccessCode = require('../lib/SuccessCode');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');

// GET /api/answers
router.get('/', async (req, res) => {
    try {
        const { questionId, page = 1, limit = 20, sort = '-voteScore' } = req.query;
        const filter = {};
        if (questionId) filter.questionId = questionId;
        const answers = await Answers.find(filter)
            .populate('userId', 'username avatarUrl reputation')
            .sort(sort).skip((page - 1) * limit).limit(parseInt(limit));
        const total = await Answers.countDocuments(filter);
        successResponse(res, { data: answers, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// GET /api/answers/:id
router.get('/:id', async (req, res) => {
    try {
        const answer = await Answers.findById(req.params.id)
            .populate('userId', 'username avatarUrl reputation').populate('questionId', 'title slug');
        if (!answer) return errorResponse(res, ErrorCode.ANSWER_NOT_FOUND);
        successResponse(res, { data: answer });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

// POST /api/answers
router.post('/', async (req, res) => {
    try {
        const answer = new Answers(req.body);
        await answer.save();
        const Questions = require('../db/models/Questions');
        await Questions.findByIdAndUpdate(req.body.questionId, { $inc: { answerCount: 1 } });
        successResponse(res, { statusCode: 201, ...SuccessCode.ANSWER_CREATED, data: answer });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// PUT /api/answers/:id
router.put('/:id', async (req, res) => {
    try {
        const answer = await Answers.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!answer) return errorResponse(res, ErrorCode.ANSWER_NOT_FOUND);
        successResponse(res, { ...SuccessCode.ANSWER_UPDATED, data: answer });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// DELETE /api/answers/:id
router.delete('/:id', async (req, res) => {
    try {
        const answer = await Answers.findByIdAndDelete(req.params.id);
        if (!answer) return errorResponse(res, ErrorCode.ANSWER_NOT_FOUND);
        const Questions = require('../db/models/Questions');
        await Questions.findByIdAndUpdate(answer.questionId, { $inc: { answerCount: -1 } });
        successResponse(res, SuccessCode.ANSWER_DELETED);
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

module.exports = router;
