const mongoose = require('mongoose');

const CommunityMemberSchema = new mongoose.Schema({
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Communities', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    role: { type: String, enum: ['member', 'moderator', 'owner'], default: 'member' },
}, { timestamps: true });

CommunityMemberSchema.index({ communityId: 1, userId: 1 }, { unique: true });
CommunityMemberSchema.index({ userId: 1 });

module.exports = mongoose.model('CommunityMembers', CommunityMemberSchema);
