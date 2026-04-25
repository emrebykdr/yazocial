const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Communities', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    content: { type: String, required: true, minlength: 1 },
    voteScore: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
}, { timestamps: true });

PostSchema.index({ communityId: 1, createdAt: -1 });
PostSchema.index({ communityId: 1, voteScore: -1 });
PostSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Posts', PostSchema);
