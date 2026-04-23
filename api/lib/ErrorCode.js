/**
 * Yazocial API — Hata Kodları Enum
 * Her modül için ayrı hata kodları tanımlanmıştır.
 */
const ErrorCode = Object.freeze({

    // ── GENEL HATALAR ──
    VALIDATION_ERROR:       { code: 'VALIDATION_ERROR',       message: 'Doğrulama hatası',                    statusCode: 400 },
    UNAUTHORIZED:           { code: 'UNAUTHORIZED',           message: 'Yetkilendirme gerekli',               statusCode: 401 },
    FORBIDDEN:              { code: 'FORBIDDEN',              message: 'Bu işlem için yetkiniz yok',          statusCode: 403 },
    NOT_FOUND:              { code: 'NOT_FOUND',              message: 'Kaynak bulunamadı',                   statusCode: 404 },
    CONFLICT:               { code: 'CONFLICT',               message: 'Kaynak zaten mevcut',                 statusCode: 409 },
    INTERNAL_ERROR:         { code: 'INTERNAL_ERROR',         message: 'Sunucu hatası',                       statusCode: 500 },

    // ── USER HATALARI ──
    USER_NOT_FOUND:         { code: 'USER_NOT_FOUND',         message: 'Kullanıcı bulunamadı',                statusCode: 404 },
    USER_ALREADY_EXISTS:    { code: 'USER_ALREADY_EXISTS',    message: 'Bu kullanıcı adı veya email zaten kullanılıyor', statusCode: 409 },
    USER_DEACTIVATED:       { code: 'USER_DEACTIVATED',       message: 'Kullanıcı hesabı deaktif',            statusCode: 403 },
    INVALID_CREDENTIALS:    { code: 'INVALID_CREDENTIALS',    message: 'Geçersiz kullanıcı adı veya şifre',  statusCode: 401 },

    // ── QUESTION HATALARI ──
    QUESTION_NOT_FOUND:     { code: 'QUESTION_NOT_FOUND',     message: 'Soru bulunamadı',                     statusCode: 404 },
    QUESTION_CLOSED:        { code: 'QUESTION_CLOSED',        message: 'Bu soru kapatılmış',                  statusCode: 403 },

    // ── ANSWER HATALARI ──
    ANSWER_NOT_FOUND:       { code: 'ANSWER_NOT_FOUND',       message: 'Cevap bulunamadı',                    statusCode: 404 },
    ANSWER_ALREADY_ACCEPTED:{ code: 'ANSWER_ALREADY_ACCEPTED',message: 'Bu cevap zaten kabul edilmiş',        statusCode: 409 },

    // ── COMMENT HATALARI ──
    COMMENT_NOT_FOUND:      { code: 'COMMENT_NOT_FOUND',      message: 'Yorum bulunamadı',                    statusCode: 404 },
    COMMENT_TOO_LONG:       { code: 'COMMENT_TOO_LONG',       message: 'Yorum çok uzun (max 1000 karakter)', statusCode: 400 },

    // ── VOTE HATALARI ──
    VOTE_OWN_POST:          { code: 'VOTE_OWN_POST',          message: 'Kendi içeriğinize oy veremezsiniz',   statusCode: 403 },
    VOTE_REMOVED:           { code: 'VOTE_REMOVED',           message: 'Oy geri çekildi',                     statusCode: 200 },
    VOTE_CHANGED:           { code: 'VOTE_CHANGED',           message: 'Oy değiştirildi',                     statusCode: 200 },
    VOTE_CREATED:           { code: 'VOTE_CREATED',           message: 'Oy verildi',                          statusCode: 201 },

    // ── TAG HATALARI ──
    TAG_NOT_FOUND:          { code: 'TAG_NOT_FOUND',          message: 'Tag bulunamadı',                      statusCode: 404 },
    TAG_ALREADY_EXISTS:     { code: 'TAG_ALREADY_EXISTS',     message: 'Bu tag zaten mevcut',                 statusCode: 409 },

    // ── ARTICLE HATALARI ──
    ARTICLE_NOT_FOUND:      { code: 'ARTICLE_NOT_FOUND',      message: 'Makale bulunamadı',                   statusCode: 404 },

    // ── PROJECT HATALARI ──
    PROJECT_NOT_FOUND:      { code: 'PROJECT_NOT_FOUND',      message: 'Proje bulunamadı',                    statusCode: 404 },

    // ── BADGE HATALARI ──
    BADGE_NOT_FOUND:        { code: 'BADGE_NOT_FOUND',        message: 'Rozet bulunamadı',                    statusCode: 404 },
    BADGE_ALREADY_ASSIGNED: { code: 'BADGE_ALREADY_ASSIGNED', message: 'Bu rozet zaten atanmış',              statusCode: 409 },

    // ── NOTIFICATION HATALARI ──
    NOTIFICATION_NOT_FOUND: { code: 'NOTIFICATION_NOT_FOUND', message: 'Bildirim bulunamadı',                 statusCode: 404 },

    // ── FOLLOW HATALARI ──
    FOLLOW_SELF:            { code: 'FOLLOW_SELF',            message: 'Kendinizi takip edemezsiniz',         statusCode: 400 },
    ALREADY_FOLLOWING:      { code: 'ALREADY_FOLLOWING',      message: 'Zaten takip ediyorsunuz',             statusCode: 409 },
    UNFOLLOWED:             { code: 'UNFOLLOWED',             message: 'Takip bırakıldı',                     statusCode: 200 },
    FOLLOWED:               { code: 'FOLLOWED',               message: 'Takip edildi',                        statusCode: 201 },
});

module.exports = ErrorCode;
