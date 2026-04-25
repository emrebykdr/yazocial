const Notifications = require('../db/models/Notifications');

/**
 * Bildirim oluşturur ve Socket.IO üzerinden anlık gönderir.
 * @param {object} app - Express app (io erişimi için)
 * @param {object} opts - { userId, type, message, relatedId, relatedModel }
 */
async function send(app, { userId, type, message, relatedId, relatedModel }) {
    try {
        const notification = new Notifications({ userId, type, message, relatedId, relatedModel });
        await notification.save();

        const io = app?.get('io');
        if (io) {
            io.to(`user:${userId.toString()}`).emit('new_notification', notification);
        }

        return notification;
    } catch (err) {
        console.error('NotificationService hatası:', err.message);
    }
}

module.exports = { send };
