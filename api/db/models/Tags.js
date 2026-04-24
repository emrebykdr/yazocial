const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true, lowercase: true },
    slug: { type: String, unique: true },
    description: { type: String, default: '', maxlength: 300 },
    usageCount: { type: Number, default: 0 }
});

// Generate slug from name before saving
TagSchema.pre('save', async function() {
    if (this.isModified('name')) {
        // Turkish character mapping
        const trMap = {
            'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
            'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
        };

        let slugBase = this.name;
        Object.keys(trMap).forEach(key => {
            slugBase = slugBase.replace(new RegExp(key, 'g'), trMap[key]);
        });

        this.slug = slugBase
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
    }
});

module.exports = mongoose.model('Tags', TagSchema);
