const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Log dizinini oluştur
const LOG_DIR = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Yazocial — Winston Logger Sınıfı
 * Singleton pattern ile tüm uygulamada tek instance kullanılır.
 *
 * Log seviyeleri (düşükten yükseğe):
 *   error > warn > info > http > debug
 *
 * Kullanım:
 *   const Logger = require('./lib/Logger');
 *   Logger.info('Kullanıcı giriş yaptı', { userId: '...' });
 *   Logger.error('Veritabanı hatası', { error: err.message });
 *   Logger.audit('user.login', { userId: '...', ip: '...' });
 */

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

// Konsol için özel format
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n  ${JSON.stringify(meta, null, 2)}` : '';
    const stackStr = stack ? `\n  ${stack}` : '';
    return `${timestamp} [${level}] ${message}${metaStr}${stackStr}`;
});

// Transport listesi
const transports = [
    // Konsol — geliştirme ortamı için renkli
    new winston.transports.Console({
        format: combine(
            colorize({ all: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            consoleFormat
        ),
        silent: process.env.NODE_ENV === 'test'
    }),

    // Tüm loglar (info+)
    new winston.transports.File({
        filename: path.join(LOG_DIR, 'app.log'),
        level: 'info',
        format: combine(timestamp(), errors({ stack: true }), json()),
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        tailable: true
    }),

    // Sadece error logları
    new winston.transports.File({
        filename: path.join(LOG_DIR, 'error.log'),
        level: 'error',
        format: combine(timestamp(), errors({ stack: true }), json()),
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
        tailable: true
    }),

    // HTTP istek logları
    new winston.transports.File({
        filename: path.join(LOG_DIR, 'http.log'),
        level: 'http',
        format: combine(timestamp(), json()),
        maxsize: 10 * 1024 * 1024,
        maxFiles: 3,
        tailable: true
    }),

    // Audit logları (ayrı dosya)
    new winston.transports.File({
        filename: path.join(LOG_DIR, 'audit.log'),
        level: 'info',
        format: combine(timestamp(), json()),
        maxsize: 20 * 1024 * 1024, // 20MB — audit loglar daha uzun tutuluyor
        maxFiles: 10,
        tailable: true
    })
];

class Logger {
    constructor() {
        if (Logger._instance) return Logger._instance;

        this._winston = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            defaultMeta: { service: 'yazocial-api' },
            transports,
            exitOnError: false
        });

        // Audit için ayrı bir logger
        this._auditLogger = winston.createLogger({
            level: 'info',
            defaultMeta: { service: 'yazocial-audit' },
            transports: [
                new winston.transports.File({
                    filename: path.join(LOG_DIR, 'audit.log'),
                    format: combine(timestamp(), json()),
                    maxsize: 20 * 1024 * 1024,
                    maxFiles: 10,
                    tailable: true
                })
            ]
        });

        Logger._instance = this;
    }

    // ── Temel log seviyeleri ──

    info(message, meta = {}) {
        this._winston.info(message, meta);
    }

    warn(message, meta = {}) {
        this._winston.warn(message, meta);
    }

    error(message, meta = {}) {
        this._winston.error(message, meta);
    }

    debug(message, meta = {}) {
        this._winston.debug(message, meta);
    }

    http(message, meta = {}) {
        this._winston.http(message, meta);
    }

    // ── Audit log — kritik işlemler ──

    audit(action, meta = {}) {
        const entry = {
            type: 'AUDIT',
            action,
            timestamp: new Date().toISOString(),
            ...meta
        };
        this._auditLogger.info(JSON.stringify(entry));
    }

    // ── Özel yardımcı metodlar ──

    // HTTP isteği logla (middleware'de kullanmak için)
    logRequest(req, res, duration) {
        this.http(`${req.method} ${req.originalUrl}`, {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.headers['x-forwarded-for'],
            userAgent: req.headers['user-agent']
        });
    }

    // DB'ye AuditLog kaydet (model ile birlikte kullanım)
    async logToDb(action, { userId = null, entityType = null, entityId = null, previousValue = null, newValue = null, ipAddress = null, userAgent = null, status = 'success', errorMessage = null, meta = null } = {}) {
        try {
            const AuditLogs = require('./db/models/AuditLogs');
            await AuditLogs.create({ userId, action, entityType, entityId, previousValue, newValue, ipAddress, userAgent, status, errorMessage, meta });
        } catch (err) {
            // DB'ye yazılamazsa sadece dosyaya yaz — kritik değil
            this.error('AuditLog DB yazma hatası', { error: err.message, action });
        }
        // Her durumda dosyaya da yaz
        this.audit(action, { userId, entityType, entityId, status, ipAddress });
    }
}

// Singleton export
module.exports = new Logger();
