/**
 * Yazocial — MongoDB Koleksiyon Oluşturma Script'i
 * Bu script tüm modelleri yükler ve MongoDB'de koleksiyonları + indeksleri oluşturur.
 */
require('dotenv').config();
const mongoose = require('mongoose');

// Tüm modelleri yükle
const Users = require('./db/models/Users');
const Questions = require('./db/models/Questions');
const Answers = require('./db/models/Answers');
const Comments = require('./db/models/Comments');
const Votes = require('./db/models/Votes');
const Tags = require('./db/models/Tags');
const Articles = require('./db/models/Articles');
const Projects = require('./db/models/Projects');
const Badges = require('./db/models/Badges');
const UserBadges = require('./db/models/UserBadges');
const Notifications = require('./db/models/Notifications');
const Follows = require('./db/models/Follows');

const models = [Users, Questions, Answers, Comments, Votes, Tags, Articles, Projects, Badges, UserBadges, Notifications, Follows];

async function syncDatabase() {
    try {
        console.log('MongoDB\'ye bağlanılıyor...');
        console.log('Connection String:', process.env.CONNECTION_STRING);
        await mongoose.connect(process.env.CONNECTION_STRING);
        console.log('✅ MongoDB bağlantısı başarılı!\n');

        console.log('Koleksiyonlar oluşturuluyor...');
        for (const model of models) {
            // createCollection + syncIndexes ile hem koleksiyon hem indeksler oluşturulur
            await model.createCollection();
            await model.syncIndexes();
            console.log(`  ✅ ${model.modelName} → koleksiyon + indeksler oluşturuldu`);
        }

        // Mevcut koleksiyonları listele
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📋 MongoDB\'deki tüm koleksiyonlar:');
        console.log('─'.repeat(40));
        collections.forEach((col, i) => {
            console.log(`  ${i + 1}. ${col.name}`);
        });
        console.log('─'.repeat(40));
        console.log(`  Toplam: ${collections.length} koleksiyon\n`);

    } catch (error) {
        console.error('❌ Hata:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB bağlantısı kapatıldı.');
    }
}

syncDatabase();
