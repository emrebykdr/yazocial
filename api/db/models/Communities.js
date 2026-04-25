const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, maxlength: 500, default: '' },
    icon: { type: String, default: null },
    banner: { type: String, default: null },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    memberCount: { type: Number, default: 1 },
    isPublic: { type: Boolean, default: true },
}, { timestamps: true });

CommunitySchema.pre('save', function () {
    if (this.isModified('name')) {
        const trMap = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
        let base = this.name;
        Object.keys(trMap).forEach(k => { base = base.replace(new RegExp(k, 'g'), trMap[k]); });
        this.slug = base.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    }
});

CommunitySchema.index({ slug: 1 });
CommunitySchema.index({ memberCount: -1 });

module.exports = mongoose.model('Communities', CommunitySchema);
