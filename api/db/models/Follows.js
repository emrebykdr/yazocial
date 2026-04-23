const mongoose = require('mongoose');

const FollowSchema = new mongoose.Schema({
    followerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    followingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }
}, { 
    timestamps: true 
});

// Prevent self-follow
FollowSchema.pre('save', function(next) {
    if (this.followerId.equals(this.followingId)) {
        return next(new Error('Kullanıcı kendini takip edemez'));
    }
    next();
});

// Ensure a user can only follow another user once
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
// Fast follower/following count queries
FollowSchema.index({ followingId: 1 });

module.exports = mongoose.model('Follows', FollowSchema);
