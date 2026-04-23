class SSEManager {
    constructor() {
        // userId -> Set of Response objects (çünkü bir kullanıcı birden fazla cihazdan/sekmeden bağlı olabilir)
        this.clients = new Map();
    }

    /**
     * Yeni bir istemci (bağlantı) ekler.
     * @param {string} userId - Kullanıcının ID'si
     * @param {object} res - Express Response nesnesi
     */
    addClient(userId, res) {
        const userIdStr = userId.toString();
        
        if (!this.clients.has(userIdStr)) {
            this.clients.set(userIdStr, new Set());
        }
        
        this.clients.get(userIdStr).add(res);

        // Bağlantı koptuğunda temizle
        res.on('close', () => {
            this.removeClient(userIdStr, res);
        });
    }

    /**
     * İstemciyi listeden siler.
     * @param {string} userId - Kullanıcının ID'si
     * @param {object} res - Kapanan Express Response nesnesi
     */
    removeClient(userId, res) {
        const userIdStr = userId.toString();
        if (this.clients.has(userIdStr)) {
            const userClients = this.clients.get(userIdStr);
            userClients.delete(res);
            
            // Eğer kullanıcının hiç aktif bağlantısı kalmadıysa Map'ten tamamen çıkar
            if (userClients.size === 0) {
                this.clients.delete(userIdStr);
            }
        }
    }

    /**
     * Belirli bir kullanıcıya event fırlatır.
     * @param {string} userId - Bildirimin gideceği kullanıcının ID'si
     * @param {string} eventType - Etkinlik tipi (örn: 'new_notification')
     * @param {object} data - Gönderilecek JSON verisi
     */
    sendToUser(userId, eventType, data) {
        const userIdStr = userId.toString();
        if (this.clients.has(userIdStr)) {
            const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
            this.clients.get(userIdStr).forEach(res => {
                try {
                    res.write(payload);
                } catch (err) {
                    console.error('SSE Gönderim Hatası:', err);
                }
            });
        }
    }

    /**
     * Tüm aktif kullanıcılara genel mesaj gönderir (Opsiyonel / Sistem Duyuruları için).
     * @param {string} eventType 
     * @param {object} data 
     */
    broadcast(eventType, data) {
        const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const userClients of this.clients.values()) {
            userClients.forEach(res => {
                try {
                    res.write(payload);
                } catch (err) {
                    console.error('SSE Broadcast Hatası:', err);
                }
            });
        }
    }
}

// Singleton olarak dışa aktar (Tüm uygulama aynı instance'ı kullanmalı)
module.exports = new SSEManager();
