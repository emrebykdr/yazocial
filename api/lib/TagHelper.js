const Tags = require('../db/models/Tags');

const TagHelper = {
    /**
     * Verilen etiket isimlerini (string dizisi) alır, veritabanında yoksa oluşturur
     * ve hepsinin ObjectId dizisini döner.
     */
    syncTags: async (tagNames) => {
        if (!tagNames || !Array.isArray(tagNames)) return [];

        const tagIds = [];
        for (let name of tagNames) {
            name = name.trim().toLowerCase();
            if (!name) continue;

            // slug'ı burada üret (Tags pre-save hook'unu bypass ediyoruz)
            const trMap = {
                'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
                'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
            };
            let slugBase = name;
            Object.keys(trMap).forEach(key => {
                slugBase = slugBase.replace(new RegExp(key, 'g'), trMap[key]);
            });
            const slug = slugBase
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-');

            // findOneAndUpdate + upsert: save() çağırmak yerine direkt DB'ye yaz
            // Bu sayede pre('save') hook tetiklenmez → "next is not a function" hatası olmaz
            const tag = await Tags.findOneAndUpdate(
                { name },
                {
                    $setOnInsert: { name, slug },
                    $inc: { usageCount: 1 }
                },
                { upsert: true, new: true, runValidators: false }
            );
            tagIds.push(tag._id);
        }
        return tagIds;
    },

    /**
     * Metin içerisinden hashtagleri (#etiket) ayıklar.
     * @param {string} text 
     * @returns {string[]} Etiket isimleri (lowercase, unique)
     */
    extractHashtags: (text) => {
        if (!text || typeof text !== 'string') return [];
        // Türkçe karakterleri destekleyen tam kapsamlı regex (çğıöşüÇĞİÖŞÜ)
        const hashtagRegex = /#([a-zA-Z0-9çğıöşüÇĞİÖŞÜ_]+)/g;
        const matches = text.match(hashtagRegex);
        if (!matches) return [];
        
        return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))];
    }
};

module.exports = TagHelper;
