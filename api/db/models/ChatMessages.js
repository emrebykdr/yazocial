const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Communities', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    content: { type: String, required: true, maxlength: 2000 },
}, { timestamps: true });

ChatMessageSchema.index({ communityId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessages', ChatMessageSchema);
