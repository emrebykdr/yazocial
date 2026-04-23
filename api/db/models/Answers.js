const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Questions', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    content: { type: String, required: true },
    isAccepted: { type: Boolean, default: false },
    voteScore: { type: Number, default: 0 }
}, { 
    timestamps: true 
});

// Indexes for performance
AnswerSchema.index({ questionId: 1, createdAt: -1 });
AnswerSchema.index({ userId: 1 });
AnswerSchema.index({ voteScore: -1 });

module.exports = mongoose.model('Answers', AnswerSchema);
