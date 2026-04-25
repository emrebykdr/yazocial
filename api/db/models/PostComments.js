const mongoose = require('mongoose');

const PostCommentSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    content: { type: String, required: true, minlength: 1, maxlength: 2000 },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostComments', default: null },
}, { timestamps: true });

PostCommentSchema.index({ postId: 1, createdAt: 1 });

module.exports = mongoose.model('PostComments', PostCommentSchema);
