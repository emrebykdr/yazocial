const mongoose = require('mongoose');
require('dotenv').config();
const Users = require('./db/models/Users');

async function fix() {
    await mongoose.connect(process.env.CONNECTION_STRING);
    const u = await Users.findOne({ email: 'abemre1313@gmail.com' });
    if (u) {
        u.role = 'admin';
        await u.save();
        console.log('Kullanıcı bulundu ve admin yapıldı:', u.username);
    } else {
        console.log('Kullanıcı bulunamadı!');
    }
    process.exit();
}
fix();
