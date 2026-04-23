const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true, 
        lowercase: true,
        minlength: [3, 'Username en az 3 karakter olmalı'],
        maxlength: [30, 'Username en fazla 30 karakter olabilir'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username sadece harf, rakam ve alt çizgi içerebilir']
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true, 
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir email adresi giriniz']
    },
    passwordHash: { type: String, required: true },
    firstName: { type: String, trim: true, maxlength: 50 },
    lastName: { type: String, trim: true, maxlength: 50 },
    avatarUrl: { type: String, default: null },
    bio: { type: String, maxlength: 500, default: '' },
    role: { 
        type: String, 
        enum: ['user', 'moderator', 'admin'], 
        default: 'user' 
    },
    reputation: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
    socialLinks: {
        github: { type: String, default: '' },
        twitter: { type: String, default: '' },
        website: { type: String, default: '' },
        linkedin: { type: String, default: '' }
    }
}, { 
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.passwordHash;
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        transform: function(doc, ret) {
            delete ret.passwordHash;
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes for performance
UserSchema.index({ reputation: -1 });
UserSchema.index({ role: 1 });

module.exports = mongoose.model('Users', UserSchema);
