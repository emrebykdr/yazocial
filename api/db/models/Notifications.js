const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    type: { 
        type: String, 
        enum: [
            'new_answer',       // Sorunuza yeni cevap geldi
            'answer_accepted',  // Cevabınız kabul edildi
            'new_comment',      // Yeni yorum
            'vote_up',          // Oy aldınız
            'badge_earned',     // Rozet kazandınız
            'new_follower',     // Yeni takipçi
            'mention',          // Bir yerde bahsedildiniz
            'system'            // Sistem bildirimi
        ],
        required: true 
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    relatedPostType: { 
        type: String, 
        enum: ['Questions', 'Answers', 'Articles', 'Projects', null], 
        default: null 
    },
    relatedPostId: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { 
    timestamps: true 
});

// Indexes for performance — okunmamış bildirimleri hızlı çekme
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Notifications', NotificationSchema);
