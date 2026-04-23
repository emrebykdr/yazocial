const mongoose = require('mongoose');

const UserBadgeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badges', required: true }
}, { 
    timestamps: true 
});

// Ensure a user only has a specific badge once
UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

module.exports = mongoose.model('UserBadges', UserBadgeSchema);
