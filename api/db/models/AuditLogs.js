const mongoose = require('mongoose');

/**
 * AuditLogs — Sistem genelinde yapılan tüm önemli işlemleri kaydeder.
 * Kim, ne zaman, ne yaptı, hangi entity üzerinde, IP'si neydi.
 */
const AuditLogSchema = new mongoose.Schema({
    // Kim yaptı
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users', 
        default: null  // null = sistem işlemi
    },

    // Ne yaptı
    action: { 
        type: String, 
        enum: [
            // Auth
            'user.register', 'user.login', 'user.logout', 'user.password_change',
            // Users
            'user.update', 'user.deactivate', 'user.role_change',
            // Questions
            'question.create', 'question.update', 'question.delete', 'question.close',
            // Answers
            'answer.create', 'answer.update', 'answer.delete', 'answer.accept',
            // Comments
            'comment.create', 'comment.update', 'comment.delete',
            // Votes
            'vote.create', 'vote.remove', 'vote.change',
            // Articles
            'article.create', 'article.update', 'article.delete', 'article.publish',
            // Projects
            'project.create', 'project.update', 'project.delete',
            // Badges
            'badge.create', 'badge.assign',
            // Tags
            'tag.create', 'tag.delete',
            // Follows
            'follow.create', 'follow.remove',
            // System
            'system.error', 'system.startup', 'system.shutdown'
        ],
        required: true
    },

    // Hangi koleksiyon üzerinde
    entityType: {
        type: String,
        enum: ['Users', 'Questions', 'Answers', 'Comments', 'Votes', 'Articles', 'Projects', 'Badges', 'Tags', 'Follows', 'System'],
        default: null
    },

    // Hangi kaydın ID'si
    entityId: { 
        type: mongoose.Schema.Types.ObjectId, 
        default: null 
    },

    // İşlem öncesi değer (update logları için)
    previousValue: { 
        type: mongoose.Schema.Types.Mixed, 
        default: null 
    },

    // İşlem sonrası / yeni değer
    newValue: { 
        type: mongoose.Schema.Types.Mixed, 
        default: null 
    },

    // İstek bilgileri
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },

    // İşlem sonucu
    status: { 
        type: String, 
        enum: ['success', 'failure'], 
        default: 'success' 
    },

    // Hata durumunda mesaj
    errorMessage: { type: String, default: null },

    // Ek meta bilgi
    meta: { type: mongoose.Schema.Types.Mixed, default: null }
}, { 
    timestamps: true,
    // AuditLog kayıtları hiçbir zaman güncellenmez — immutable
    versionKey: false
});

// Performance indexes
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ status: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 }); // Genel zaman bazlı sorgular

// AuditLog kayıtları güncellenmez
AuditLogSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
    next(new Error('AuditLog kayıtları değiştirilemez'));
});

module.exports = mongoose.model('AuditLogs', AuditLogSchema);
