const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    postType: { type: String, enum: ['Questions', 'Articles'], required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'postType' },
}, { timestamps: true });

BookmarkSchema.index({ userId: 1, postId: 1, postType: 1 }, { unique: true });

module.exports = mongoose.model('Bookmarks', BookmarkSchema);
