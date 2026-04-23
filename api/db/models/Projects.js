const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 2000 },
    githubUrl: { type: String },
    demoUrl: { type: String },
    thumbnailUrl: { type: String, default: null },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tags' }],
    score: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['active', 'archived'], 
        default: 'active' 
    }
}, { 
    timestamps: true 
});

// Indexes for performance
ProjectSchema.index({ userId: 1, createdAt: -1 });
ProjectSchema.index({ score: -1 });
ProjectSchema.index({ tags: 1 });
ProjectSchema.index({ status: 1 });

module.exports = mongoose.model('Projects', ProjectSchema);
