/**
 * Yazocial API — Başarı Mesajları Enum
 */
const SuccessCode = Object.freeze({
    // ── USER ──
    USER_CREATED:           { code: 'USER_CREATED',           message: 'Kullanıcı başarıyla oluşturuldu' },
    USER_UPDATED:           { code: 'USER_UPDATED',           message: 'Kullanıcı başarıyla güncellendi' },
    USER_DEACTIVATED:       { code: 'USER_DEACTIVATED',       message: 'Kullanıcı deaktif edildi' },

    // ── QUESTION ──
    QUESTION_CREATED:       { code: 'QUESTION_CREATED',       message: 'Soru başarıyla oluşturuldu' },
    QUESTION_UPDATED:       { code: 'QUESTION_UPDATED',       message: 'Soru başarıyla güncellendi' },
    QUESTION_DELETED:       { code: 'QUESTION_DELETED',       message: 'Soru silindi' },
    ANSWER_ACCEPTED:        { code: 'ANSWER_ACCEPTED',        message: 'Cevap kabul edildi' },

    // ── ANSWER ──
    ANSWER_CREATED:         { code: 'ANSWER_CREATED',         message: 'Cevap başarıyla oluşturuldu' },
    ANSWER_UPDATED:         { code: 'ANSWER_UPDATED',         message: 'Cevap başarıyla güncellendi' },
    ANSWER_DELETED:         { code: 'ANSWER_DELETED',         message: 'Cevap silindi' },

    // ── COMMENT ──
    COMMENT_CREATED:        { code: 'COMMENT_CREATED',        message: 'Yorum başarıyla oluşturuldu' },
    COMMENT_UPDATED:        { code: 'COMMENT_UPDATED',        message: 'Yorum başarıyla güncellendi' },
    COMMENT_DELETED:        { code: 'COMMENT_DELETED',        message: 'Yorum ve yanıtları silindi' },

    // ── TAG ──
    TAG_CREATED:            { code: 'TAG_CREATED',            message: 'Tag başarıyla oluşturuldu' },
    TAG_UPDATED:            { code: 'TAG_UPDATED',            message: 'Tag başarıyla güncellendi' },
    TAG_DELETED:            { code: 'TAG_DELETED',             message: 'Tag silindi' },

    // ── ARTICLE ──
    ARTICLE_CREATED:        { code: 'ARTICLE_CREATED',        message: 'Makale başarıyla oluşturuldu' },
    ARTICLE_UPDATED:        { code: 'ARTICLE_UPDATED',        message: 'Makale başarıyla güncellendi' },
    ARTICLE_DELETED:        { code: 'ARTICLE_DELETED',        message: 'Makale silindi' },

    // ── PROJECT ──
    PROJECT_CREATED:        { code: 'PROJECT_CREATED',        message: 'Proje başarıyla oluşturuldu' },
    PROJECT_UPDATED:        { code: 'PROJECT_UPDATED',        message: 'Proje başarıyla güncellendi' },
    PROJECT_DELETED:        { code: 'PROJECT_DELETED',        message: 'Proje silindi' },

    // ── BADGE ──
    BADGE_CREATED:          { code: 'BADGE_CREATED',          message: 'Rozet başarıyla oluşturuldu' },
    BADGE_UPDATED:          { code: 'BADGE_UPDATED',          message: 'Rozet başarıyla güncellendi' },
    BADGE_DELETED:          { code: 'BADGE_DELETED',           message: 'Rozet silindi' },
    BADGE_ASSIGNED:         { code: 'BADGE_ASSIGNED',         message: 'Rozet kullanıcıya atandı' },

    // ── NOTIFICATION ──
    NOTIFICATION_READ:      { code: 'NOTIFICATION_READ',      message: 'Bildirim okundu olarak işaretlendi' },
    NOTIFICATIONS_READ_ALL: { code: 'NOTIFICATIONS_READ_ALL', message: 'Tüm bildirimler okundu olarak işaretlendi' },
    NOTIFICATION_DELETED:   { code: 'NOTIFICATION_DELETED',   message: 'Bildirim silindi' },
});

module.exports = SuccessCode;
