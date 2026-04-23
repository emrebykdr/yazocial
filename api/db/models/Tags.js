const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true, lowercase: true },
    slug: { type: String, unique: true },
    description: { type: String, default: '', maxlength: 300 }
});

// Generate slug from name before saving
TagSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
    }
    next();
});

module.exports = mongoose.model('Tags', TagSchema);
