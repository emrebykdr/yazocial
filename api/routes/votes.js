const express = require('express');
const router = express.Router();
const Votes = require('../db/models/Votes');

// POST /api/votes — Oy ver (Up/Down) — toggle mantığı
router.post('/', async (req, res) => {
    try {
        const { userId, postType, postId, voteType } = req.body;

        // Mevcut oyu kontrol et
        const existingVote = await Votes.findOne({ userId, postType, postId });

        let scoreChange = 0;

        if (existingVote) {
            if (existingVote.voteType === voteType) {
                // Aynı oy → oyu geri çek
                await Votes.findByIdAndDelete(existingVote._id);
                scoreChange = voteType === 'Up' ? -1 : 1;
                // İlgili postun voteScore'unu güncelle
                await updateVoteScore(postType, postId, scoreChange);
                return res.json({ success: true, message: 'Oy geri çekildi', action: 'removed', scoreChange });
            } else {
                // Farklı oy → oyu değiştir
                existingVote.voteType = voteType;
                await existingVote.save();
                scoreChange = voteType === 'Up' ? 2 : -2; // -1 (eski) + 1 (yeni) = 2 fark
                await updateVoteScore(postType, postId, scoreChange);
                return res.json({ success: true, message: 'Oy değiştirildi', action: 'changed', scoreChange });
            }
        }

        // Yeni oy
        const vote = new Votes({ userId, postType, postId, voteType });
        await vote.save();
        scoreChange = voteType === 'Up' ? 1 : -1;
        await updateVoteScore(postType, postId, scoreChange);
        res.status(201).json({ success: true, message: 'Oy verildi', action: 'created', scoreChange });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// GET /api/votes?postType=Questions&postId=xxx — Bir postun oylarını getir
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
        res.json({ success: true, data: { upVotes, downVotes, score: upVotes - downVotes, votes } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// voteScore güncelleme yardımcı fonksiyonu
async function updateVoteScore(postType, postId, scoreChange) {
    const modelMap = {
        'Questions': require('../db/models/Questions'),
        'Answers': require('../db/models/Answers')
    };
    const Model = modelMap[postType];
    if (Model) {
        await Model.findByIdAndUpdate(postId, { $inc: { voteScore: scoreChange } });
    }
}

module.exports = router;
