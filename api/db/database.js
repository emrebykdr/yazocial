const mongoose = require('mongoose');
require('dotenv').config();

let instance = null;

class Database {
    constructor() {
        if (!instance) {
            this.mongoConnection = null;
            instance = this;
        }
        return instance;
    }

    async connect() {
        try {
            let db = await mongoose.connect(process.env.CONNECTION_STRING);
            this.mongoConnection = db;
            console.log('MongoDB bağlantısı başarılı');
        } catch (error) {
            console.error('MongoDB bağlantı hatası:', error.message);
            process.exit(1);
        }
    }
}

module.exports = Database;