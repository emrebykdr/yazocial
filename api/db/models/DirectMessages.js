const mongoose = require('mongoose');

const DirectMessageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversations', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    content: { type: String, required: true, maxlength: 4000 },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
}, { timestamps: true });

DirectMessageSchema.index({ conversationId: 1, createdAt: 1 });
DirectMessageSchema.index({ senderId: 1 });

module.exports = mongoose.model('DirectMessages', DirectMessageSchema);
