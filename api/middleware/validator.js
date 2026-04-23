const { errorResponse } = require('../lib/ResponseHelper');
const ErrorCode = require('../lib/ErrorCode');

/**
 * Jenerik Joi Validation Middleware
 * Gelen şemaya (schema) göre request body, query veya params doğrulaması yapar.
 * 
 * @param {object} schema - Joi şeması
 * @param {string} source - 'body', 'query', veya 'params' (varsayılan: 'body')
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false, // Tüm hataları toplar (ilkinde durmaz)
            stripUnknown: true // Şemada olmayan alanları otomatik siler (güvenlik için)
        });

        if (error) {
            // Joi hatalarını tek bir metin haline getir (virgülle ayrılmış)
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            return errorResponse(res, ErrorCode.VALIDATION_ERROR, errorMessage);
        }

        // Doğrulanmış ve temizlenmiş veriyi req nesnesine geri koy
        req[source] = value;
        next();
    };
};

module.exports = validate;
