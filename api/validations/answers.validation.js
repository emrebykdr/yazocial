const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const create = Joi.object({
    questionId: Joi.string().pattern(objectIdPattern).required().messages({
        'string.pattern.base': 'Geçersiz soru ID formatı.',
        'any.required': 'Soru ID zorunludur.'
    }),
    content: Joi.string().min(10).required().messages({
        'string.min': 'Cevap içeriği en az 10 karakter olmalıdır.',
        'any.required': 'Cevap içeriği zorunludur.'
    })
});

const update = Joi.object({
    content: Joi.string().min(10).required().messages({
        'string.min': 'Cevap içeriği en az 10 karakter olmalıdır.',
        'any.required': 'Güncellenecek içerik zorunludur.'
    })
});

module.exports = {
    create,
    update
};
