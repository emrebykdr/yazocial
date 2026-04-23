const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const create = Joi.object({
    postType: Joi.string().valid('Questions', 'Answers', 'Articles').required().messages({
        'any.only': 'postType sadece Questions, Answers veya Articles olabilir.',
        'any.required': 'Yorumun yapılacağı içerik türü (postType) zorunludur.'
    }),
    postId: Joi.string().pattern(objectIdPattern).required().messages({
        'string.pattern.base': 'Geçersiz içerik ID formatı.',
        'any.required': 'İçerik ID (postId) zorunludur.'
    }),
    parentId: Joi.string().pattern(objectIdPattern).optional().messages({
        'string.pattern.base': 'Geçersiz parent ID formatı.'
    }),
    content: Joi.string().min(2).max(1000).required().messages({
        'string.min': 'Yorum içeriği en az 2 karakter olmalıdır.',
        'string.max': 'Yorum içeriği en fazla 1000 karakter olmalıdır.',
        'any.required': 'Yorum içeriği zorunludur.'
    })
});

const update = Joi.object({
    content: Joi.string().min(2).max(1000).required().messages({
        'string.min': 'Yorum içeriği en az 2 karakter olmalıdır.',
        'string.max': 'Yorum içeriği en fazla 1000 karakter olmalıdır.',
        'any.required': 'Güncellenecek içerik zorunludur.'
    })
});

module.exports = {
    create,
    update
};
