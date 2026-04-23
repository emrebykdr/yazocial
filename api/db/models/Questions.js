const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    title: { 
        type: String, 
        required: true, 
        trim: true,
        minlength: [10, 'Başlık en az 10 karakter olmalı'],
        maxlength: [200, 'Başlık en fazla 200 karakter olabilir']
    },
    slug: { type: String, unique: true },
    content: { type: String, required: true },
    acceptedAnswerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Answers', default: null },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tags' }],
    viewCount: { type: Number, default: 0 },
    voteScore: { type: Number, default: 0 },
    answerCount: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['open', 'closed', 'duplicate'], 
        default: 'open' 
    }
}, { 
    timestamps: true 
});

// Generate slug from title before saving
QuestionSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 100) + '-' + Date.now().toString(36);
    }
    next();
});

// Indexes for performance
QuestionSchema.index({ userId: 1, createdAt: -1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ voteScore: -1 });
QuestionSchema.index({ status: 1 });

module.exports = mongoose.model('Questions', QuestionSchema);
