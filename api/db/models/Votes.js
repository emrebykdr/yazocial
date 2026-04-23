const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    postType: { 
        type: String, 
        enum: ['Questions', 'Answers', 'Comments'], 
        required: true 
    },
    postId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'postType' },
    voteType: { type: String, enum: ['Up', 'Down'], required: true }
}, { 
    timestamps: true 
});

// Ensure a user can only vote once per post
VoteSchema.index({ userId: 1, postType: 1, postId: 1 }, { unique: true });

// Fast aggregation of vote scores
VoteSchema.index({ postType: 1, postId: 1, voteType: 1 });

module.exports = mongoose.model('Votes', VoteSchema);
