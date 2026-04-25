const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, error: 'Çok fazla deneme. 15 dakika sonra tekrar deneyin.' },
    standardHeaders: true,
    legacyHeaders: false,
});
const Users = require('../db/models/Users');
const ErrorCode = require('../lib/ErrorCode');
const SuccessCode = require('../lib/SuccessCode');
const { successResponse, errorResponse } = require('../lib/ResponseHelper');
const Logger = require('../lib/Logger');
const validate = require('../middleware/validator');
const authValidation = require('../validations/auth.validation');

/**
 * POST /api/auth/register
 */
router.post('/register', authLimiter, validate(authValidation.register), async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        // Kullanıcı oluştur (passwordHash olarak password gönderiyoruz, model pre-save hook hash'leyecek)
        const user = new Users({
            username,
            email,
            passwordHash: password,
            firstName,
            lastName
        });

        await user.save();

        // Audit Log
        await Logger.logToDb('user.register', {
            userId: user._id,
            entityType: 'Users',
            entityId: user._id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        successResponse(res, { 
            statusCode: 201, 
            ...SuccessCode.USER_CREATED, 
            data: user 
        });
    } catch (error) {
        if (error.code === 11000) return errorResponse(res, ErrorCode.USER_ALREADY_EXISTS);
        errorResponse(res, ErrorCode.VALIDATION_ERROR, error.message);
    }
});

/**
 * POST /api/auth/login
 */
router.post('/login', authLimiter, validate(authValidation.login), async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier = username veya email olabilir

        // Kullanıcıyı bul (username veya email ile)
        const user = await Users.findOne({
            $or: [{ username: identifier.toLowerCase() }, { email: identifier.toLowerCase() }]
        }).select('+passwordHash'); // Normalde passwordHash exclude edilir, burada ihtiyacımız var

        if (!user || !user.isActive) {
            return errorResponse(res, ErrorCode.INVALID_CREDENTIALS);
        }

        // Şifre kontrolü
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Başarısız giriş denemesi audit
            await Logger.logToDb('user.login', {
                userId: user._id,
                status: 'failure',
                errorMessage: 'Geçersiz şifre',
                ipAddress: req.ip
            });
            return errorResponse(res, ErrorCode.INVALID_CREDENTIALS);
        }

        // Token oluştur
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Son giriş zamanını güncelle
        user.lastLoginAt = new Date();
        await user.save();

        // Başarılı giriş audit
        await Logger.logToDb('user.login', {
            userId: user._id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        successResponse(res, {
            message: 'Giriş başarılı',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    avatarUrl: user.avatarUrl
                }
            }
        });
    } catch (error) {
        errorResponse(res, ErrorCode.INTERNAL_ERROR, error.message);
    }
});

module.exports = router;
