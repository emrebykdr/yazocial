const Joi = require('joi');

const register = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
        'string.base': 'Kullanıcı adı metin formatında olmalıdır.',
        'string.alphanum': 'Kullanıcı adı sadece harf ve rakamlardan oluşabilir.',
        'string.min': 'Kullanıcı adı en az 3 karakter olmalıdır.',
        'string.max': 'Kullanıcı adı en fazla 30 karakter olmalıdır.',
        'any.required': 'Kullanıcı adı zorunludur.'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Geçerli bir e-posta adresi giriniz.',
        'any.required': 'E-posta adresi zorunludur.'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Şifre en az 6 karakter olmalıdır.',
        'any.required': 'Şifre zorunludur.'
    }),
    firstName: Joi.string().max(50).optional().allow(''),
    lastName: Joi.string().max(50).optional().allow('')
});

const login = Joi.object({
    identifier: Joi.string().required().messages({
        'any.required': 'Kullanıcı adı veya e-posta adresi zorunludur.'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Şifre zorunludur.'
    })
});

module.exports = {
    register,
    login
};
