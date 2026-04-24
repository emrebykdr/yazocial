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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for answers
QuestionSchema.virtual('answers', {
    ref: 'Answers',
    localField: '_id',
    foreignField: 'questionId'
});

// Generate slug from title before saving
QuestionSchema.pre('save', async function() {
    if (this.isModified('title')) {
        // Turkish character mapping
        const trMap = {
            'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
            'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
        };

        let slugBase = this.title;
        Object.keys(trMap).forEach(key => {
            slugBase = slugBase.replace(new RegExp(key, 'g'), trMap[key]);
        });

        this.slug = slugBase
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 100) + '-' + Date.now().toString(36);
    }
});

// Indexes for performance
QuestionSchema.index({ userId: 1, createdAt: -1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ voteScore: -1 });
QuestionSchema.index({ status: 1 });

module.exports = mongoose.model('Questions', QuestionSchema);
