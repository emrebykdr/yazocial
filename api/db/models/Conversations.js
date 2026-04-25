const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }],
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
    lastSenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
}, { timestamps: true });

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversations', ConversationSchema);
