const Joi = require('joi');


// ObjectID (MongoDB id) doğrulaması için regex
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const create = Joi.object({
    title: Joi.string().min(5).max(150).required().messages({
        'string.min': 'Soru başlığı en az 5 karakter olmalıdır.',
        'string.max': 'Soru başlığı en fazla 150 karakter olmalıdır.',
        'any.required': 'Soru başlığı zorunludur.'
    }),
    body: Joi.string().min(20).required().messages({
        'string.min': 'Soru içeriği en az 20 karakter olmalıdır.',
        'any.required': 'Soru içeriği zorunludur.'
    }),
    tags: Joi.array().items(
        Joi.string().pattern(objectIdPattern).messages({
            'string.pattern.base': 'Geçersiz etiket ID formatı.'
        })
    ).max(5).messages({
        'array.max': 'En fazla 5 etiket ekleyebilirsiniz.'
    })
});

const update = Joi.object({
    title: Joi.string().min(5).max(150).messages({
        'string.min': 'Soru başlığı en az 5 karakter olmalıdır.',
        'string.max': 'Soru başlığı en fazla 150 karakter olmalıdır.'
    }),
    body: Joi.string().min(20).messages({
        'string.min': 'Soru içeriği en az 20 karakter olmalıdır.'
    }),
    tags: Joi.array().items(
        Joi.string().pattern(objectIdPattern).messages({
            'string.pattern.base': 'Geçersiz etiket ID formatı.'
        })
    ).max(5).messages({
        'array.max': 'En fazla 5 etiket ekleyebilirsiniz.'
    })
}).min(1).messages({
    'object.min': 'Güncellenecek en az bir alan belirtilmelidir.'
});

module.exports = {
    create,
    update
};
