const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    content: { type: String, required: true, maxlength: 1000 },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comments', default: null }, // Thread system
    postType: { 
        type: String, 
        enum: ['Questions', 'Answers', 'Articles'], 
        required: true 
    },
    postId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'postType' },
    isEdited: { type: Boolean, default: false }
}, { 
    timestamps: true 
});

// Indexes for performance
CommentSchema.index({ postType: 1, postId: 1, createdAt: 1 });
CommentSchema.index({ parentId: 1 });
CommentSchema.index({ userId: 1 });

module.exports = mongoose.model('Comments', CommentSchema);
