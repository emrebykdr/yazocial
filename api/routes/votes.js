const express = require('express');
const router = express.Router();
const Votes = require('../db/models/Votes');
const ErrorCode = require('../lib/ErrorCode');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');
const { authenticate } = require('../middleware/auth');

// POST /api/votes — toggle mantığı
router.post('/', authenticate, async (req, res) => {
    try {
        const { postType, postId, voteType } = req.body;
        const userId = req.user._id;
        
        const existingVote = await Votes.findOne({ userId, postType, postId });
        let scoreChange = 0;

        if (existingVote) {
            if (existingVote.voteType === voteType) {
                await Votes.findByIdAndDelete(existingVote._id);
                scoreChange = voteType === 'Up' ? -1 : 1;
                await updateVoteScore(postType, postId, scoreChange);
                return successResponse(res, { ...ErrorCode.VOTE_REMOVED, scoreChange, action: 'removed' });
            } else {
                existingVote.voteType = voteType;
                await existingVote.save();
                scoreChange = voteType === 'Up' ? 2 : -2;
                await updateVoteScore(postType, postId, scoreChange);
                return successResponse(res, { ...ErrorCode.VOTE_CHANGED, scoreChange, action: 'changed' });
            }
        }

        const vote = new Votes({ userId, postType, postId, voteType });
        await vote.save();
        scoreChange = voteType === 'Up' ? 1 : -1;
        await updateVoteScore(postType, postId, scoreChange);
        successResponse(res, { statusCode: 201, ...ErrorCode.VOTE_CREATED, scoreChange, action: 'created' });
    } catch (error) {
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

// GET /api/votes
router.get('/', async (req, res) => {
    try {
        const { postType, postId, userId } = req.query;
        const filter = {};
        if (postType) filter.postType = postType;
        if (postId) filter.postId = postId;
        if (userId) filter.userId = userId;
        const votes = await Votes.find(filter);
        const upVotes = votes.filter(v => v.voteType === 'Up').length;
        const downVotes = votes.filter(v => v.voteType === 'Down').length;
        successResponse(res, { data: { upVotes, downVotes, score: upVotes - downVotes, votes } });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

async function updateVoteScore(postType, postId, scoreChange) {
    const modelMap = {
        'Questions': require('../db/models/Questions'),
        'Answers': require('../db/models/Answers')
    };
    const Model = modelMap[postType];
    if (Model) await Model.findByIdAndUpdate(postId, { $inc: { voteScore: scoreChange } });
}

module.exports = router;
