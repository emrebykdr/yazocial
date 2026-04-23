/**
 * Yazocial API — Yardımcı Response Fonksiyonları
 * Router'larda tutarlı response formatı sağlar.
 */

function successResponse(res, { statusCode = 200, code, message, data, pagination, ...extra }) {
    return res.status(statusCode).json({
        success: true,
        code,
        message,
        data,
        ...(pagination && { pagination }),
        ...extra
    });
}

function errorResponse(res, errorEnum, details = null) {
    return res.status(errorEnum.statusCode).json({
        success: false,
        code: errorEnum.code,
        error: errorEnum.message,
        ...(details && { details })
    });
}

module.exports = { successResponse, errorResponse };
