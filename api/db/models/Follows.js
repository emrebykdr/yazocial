const mongoose = require('mongoose');

const FollowSchema = new mongoose.Schema({
    followerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    followingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }
}, { 
    timestamps: true 
});

// Prevent self-follow
FollowSchema.pre('save', async function() {
    if (this.followerId.equals(this.followingId)) {
        throw new Error('Kullanıcı kendini takip edemez');
    }
});

// Ensure a user can only follow another user once
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
// Fast follower/following count queries
FollowSchema.index({ followingId: 1 });

module.exports = mongoose.model('Follows', FollowSchema);
