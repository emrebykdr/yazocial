const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, maxlength: 300 },
    iconUrl: { type: String, default: null },
    criteria: { type: String, default: '' } // Badge kazanma koşulları açıklaması
});

module.exports = mongoose.model('Badges', BadgeSchema);
