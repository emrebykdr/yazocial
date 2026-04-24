const jwt = require('jsonwebtoken');
const Users = require('../db/models/Users');
const ErrorCode = require('../lib/ErrorCode');
const { errorResponse } = require('../lib/ResponseHelper');

/**
 * JWT Doğrulama Middleware
 */
const authenticate = async (req, res, next) => {
    try {
        let token;

        // Header kontrolü (Authorization: Bearer <token>)
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.query.token) {
            // SSE (Server-Sent Events) için Query'den token okuma desteği
            token = req.query.token;
        }

        if (!token) {
            return errorResponse(res, ErrorCode.UNAUTHORIZED);
        }

        // Token doğrulama
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Kullanıcıyı bul ve aktiflik kontrolü yap
        const user = await Users.findById(decoded.id);
        
        if (!user || !user.isActive) {
            return errorResponse(res, ErrorCode.UNAUTHORIZED);
        }

        // Kullanıcı bilgisini req nesnesine ekle
        req.user = user;
        if (typeof next === 'function') {
            next();
        } else {
            console.error('Auth Error: next is not a function');
            return errorResponse(res, ErrorCode.INTERNAL_ERROR, 'Internal Server Error (Middleware Chain Broken)');
        }
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return errorResponse(res, { ...ErrorCode.UNAUTHORIZED, message: 'Oturum süresi doldu, lütfen tekrar giriş yapın' });
        }
        return errorResponse(res, ErrorCode.UNAUTHORIZED);
    }
};

/**
 * Rol Yetki Kontrolü Middleware
 * Örnek kullanım: authorize('admin', 'moderator')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return errorResponse(res, ErrorCode.FORBIDDEN);
        }
        next();
    };
};

module.exports = { authenticate, authorize };
