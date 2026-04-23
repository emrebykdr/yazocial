/**
 * Yazocial API — HTTP Durum Kodları
 */
const HttpStatusCode = Object.freeze({
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    INTERNAL_SERVER: 500
});

module.exports = HttpStatusCode;
