require('dotenv').config();
const mongoose = require('mongoose');

const Users = require('./db/models/Users');
const Communities = require('./db/models/Communities');
const Posts = require('./db/models/Posts');
const Questions = require('./db/models/Questions');
const Tags = require('./db/models/Tags');

async function seedData() {
    try {
        console.log('MongoDB\'ye bağlanılıyor...');
        await mongoose.connect(process.env.CONNECTION_STRING);
        console.log('Bağlantı başarılı!');

        console.log('Koleksiyonlar temizleniyor...');
        await Users.deleteMany({});
        await Communities.deleteMany({});
        await Posts.deleteMany({});
        await Questions.deleteMany({});
        await Tags.deleteMany({});

        console.log('Kullanıcılar oluşturuluyor...');
        const user1 = await Users.create({
            username: 'yazilimci_genclik',
            email: 'genclik@test.com',
            passwordHash: 'dummy', // pre-save hook hashes it if it wasn't already, but bcrypt takes cleartext. Wait, the schema says: this.passwordHash = await bcrypt.hash(this.passwordHash, salt); so we pass cleartext here!
            firstName: 'Yazılım',
            lastName: 'Genci',
            bio: 'Sadece kod yazarım, kahve içerim.',
            reputation: 150
        });

        const user2 = await Users.create({
            username: 'senior_dev',
            email: 'senior@test.com',
            passwordHash: 'dummy123',
            firstName: 'Ahmet',
            lastName: 'Yılmaz',
            bio: '10 yıllık deneyimli yazılım mühendisi.',
            reputation: 540
        });

        const user3 = await Users.create({
            username: 'react_lover',
            email: 'react@test.com',
            passwordHash: 'dummy123',
            firstName: 'Ayşe',
            lastName: 'Kaya',
            bio: 'Frontend benim hayatım.',
            reputation: 210
        });

        console.log('Etiketler oluşturuluyor...');
        const tag1 = await Tags.create({ name: 'javascript', description: 'JavaScript ile ilgili her şey', usageCount: 15 });
        const tag2 = await Tags.create({ name: 'react', description: 'React.js framework', usageCount: 22 });
        const tag3 = await Tags.create({ name: 'nodejs', description: 'Node.js backend', usageCount: 10 });
        const tag4 = await Tags.create({ name: 'python', description: 'Python programlama dili', usageCount: 8 });

        console.log('Topluluklar oluşturuluyor...');
        const comm1 = await Communities.create({
            name: 'React Türkiye',
            description: 'Türkiye\'nin en büyük React topluluğu.',
            ownerId: user3._id,
            memberCount: 150
        });

        const comm2 = await Communities.create({
            name: 'Node.js Geliştiricileri',
            description: 'Backend dünyasında Node.js konuşuyoruz.',
            ownerId: user2._id,
            memberCount: 80
        });

        const comm3 = await Communities.create({
            name: 'Genel Yazılım',
            description: 'Yazılıma dair her şey.',
            ownerId: user1._id,
            memberCount: 500
        });

        console.log('Gönderiler (Posts) oluşturuluyor...');
        await Posts.create([
            {
                communityId: comm1._id,
                userId: user3._id,
                title: 'React 19 özellikleri hakkında ne düşünüyorsunuz?',
                content: 'Bence concurrent rendering çok gelişmiş.',
                voteScore: 25,
                commentCount: 4
            },
            {
                communityId: comm1._id,
                userId: user1._id,
                title: 'Zustand vs Redux',
                content: 'Artık sadece Zustand kullanıyorum. Çok daha basit değil mi?',
                voteScore: 18,
                commentCount: 12
            },
            {
                communityId: comm2._id,
                userId: user2._id,
                title: 'Express yerine Fastify?',
                content: 'Performans testlerine göre Fastify açık ara önde. Siz projelerinizde ne kullanıyorsunuz?',
                voteScore: 40,
                commentCount: 8
            }
        ]);

        console.log('Sorular (Questions) oluşturuluyor...');
        await Questions.create([
            {
                userId: user1._id,
                title: 'JavaScript closure mantığı tam olarak nedir?',
                content: 'Bir türlü anlayamadım, basit bir örnekle açıklayabilir misiniz?',
                tags: [tag1._id],
                viewCount: 120,
                voteScore: 15,
                answerCount: 3
            },
            {
                userId: user3._id,
                title: 'React useEffect bağımlılık dizisinde obje kullanımı',
                content: 'Obje referansı değiştiği için sürekli tetikleniyor. Nasıl çözerim?',
                tags: [tag2._id],
                viewCount: 85,
                voteScore: 10,
                answerCount: 2
            },
            {
                userId: user2._id,
                title: 'Mongoose populate çok mu yavaş çalışıyor?',
                content: 'Aggregation pipeline kullanmak yerine populate kullanmanın dezavantajları neler?',
                tags: [tag3._id],
                viewCount: 200,
                voteScore: 30,
                answerCount: 5
            }
        ]);

        console.log('✅ Örnek veriler başarıyla eklendi!');
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Bağlantı kapatıldı.');
    }
}

seedData();
