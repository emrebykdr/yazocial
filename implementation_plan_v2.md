# Yazocial V2 — Teknik Borç & Geliştirme Planı

Son güncelleme: 2026-04-24

---

## FAZ 1 — Kritik Güvenlik & Stabilizasyon

### [DONE] ENV Variables
- [x] `client/.env` → `VITE_API_URL`, `VITE_SOCKET_URL`
- [x] `api/services/api.js`, `socket.js`, `NotificationContext.jsx` hardcoded URL'leri kaldır

### [DONE] Rate Limiting
- [x] `express-rate-limit` kur
- [x] Auth route'larına (login, register) 10 req/15 min limit
- [x] Upload route'una 20 req/saat limit

### [DONE] CORS Düzeltmesi
- [x] `api/bin/www` → `origin: process.env.CLIENT_URL`

### [DONE] NoSQL Injection Koruması
- [x] Search alanlarında regex escape: `users`, `questions`, `communities`

### [DONE] Input Validation Eksiklikleri
- [x] `routes/posts.js` → Joi validation
- [x] `routes/conversations.js` → Joi validation
- [x] `routes/communities.js` → Joi validation

---

## FAZ 2 — Mimari İyileştirmeler

### [DONE] SSE → Socket.IO Migrasyonu
- [x] `NotificationContext.jsx` SSE bağlantısını Socket.IO event'ine taşı
- [x] `api/lib/SSEManager.js` kullanımını Socket.IO emit ile değiştir
- [x] SSE stream endpoint'i kaldır (geriye dönük uyumluluk için 30 gün bırak)

### [DONE] Notification Service
- [x] `api/services/NotificationService.js` oluştur
- [x] `answers.js`, `comments.js`, `follows.js` route'larında inline notification kodunu kaldır

### [DONE] Ownership Middleware
- [x] `api/middleware/ownership.js` — `requireOwnerOrAdmin(Model)` helper
- [x] `answers`, `comments`, `posts` route'larında kullan

### [DONE] Pagination Standardizasyonu
- [x] `routes/conversations.js` — GET / pagination ekle
- [x] `routes/follows.js` — pagination ekle
- [x] Tüm route'larda `DEFAULT_PAGE_SIZE` constant kullan

### [DONE] Database Index Eksiklikleri
- [x] `Comments.js` → `userId` index
- [x] `Posts.js` → `userId + createdAt` index
- [x] `DirectMessages.js` → `senderId + createdAt` index

---

## FAZ 3 — Topluluk Özelliği Geliştirme

### [DONE] Topluluk Sohbeti Kaldırma
- [x] `CommunityDetail.jsx` chat sekmesini sil
- [x] `api/db/models/ChatMessages.js` kaldır (migration: veri yedekle)
- [x] `bin/www` socket community_chat handler'larını kaldır

### [DONE] Gelişmiş Topluluk Sistemi
- [x] `PostDetail.jsx` — ayrı gönderi detay sayfası (yorum thread'i ile)
- [x] Post oylaması (upvote/downvote)
- [x] Yorum reply (thread)
- [x] Topluluk istatistikleri (post sayısı, haftalık aktif üye)
- [x] Üye listesi sekmesi
- [x] Pinned post desteği
- [x] Topluluk kuralları alanı (description genişletme)
- [x] Kategori/etiket sistemi

---

## FAZ 4 — Eksik Özellikler

### [DONE] Bookmark Sayfası
- [x] `/bookmarks` route'u ekle → `Bookmarks.jsx` sayfası
- [x] Sidebar'a link ekle

### [DONE] Takip Et Butonu
- [x] Profile.jsx'teki "Takip Et" → `/api/follows` bağla
- [x] Takipçi/takip sayısı gerçek veriden çek

### [DONE] Şifre Sıfırlama
- [x] `api/routes/auth.js` → `POST /forgot-password`, `POST /reset-password`
- [x] Client: `ForgotPassword.jsx`

### [DONE] Error Boundary
- [x] `client/src/components/ErrorBoundary.jsx`
- [x] `App.jsx`'te sarmalama

---

## FAZ 5 — Performans & UX

### [DONE] React Query Optimizasyonu
- [x] Global `staleTime: 5 * 60 * 1000`
- [x] DM'de polling → Socket.IO event

### [DONE] Search Debounce
- [x] `useDebounce` hook → Communities, Explore, Home sayfaları

### [DONE] SEO Tamamlama
- [x] Eksik Helmet: Explore, Popular, Profile, Communities, CommunityDetail

### [DONE] Accessibility
- [x] Tüm icon button'lara `aria-label`
- [x] `<img>` tag'larına `alt` attribute

---

## Öncelik Matrisi

| # | Görev | Etki | Süre |
|---|-------|------|------|
| 1 | ENV Variables | Kritik | 30 dk |
| 2 | Rate Limiting | Güvenlik | 1 saat |
| 3 | CORS | Güvenlik | 15 dk |
| 4 | Community geliştirme | UX | 4 saat |
| 5 | SSE→Socket.IO | Mimari | 2 saat |
| 6 | Error Boundary | Stabilite | 1 saat |
| 7 | Pagination | Performans | 2 saat |
| 8 | Bookmark sayfası | Feature | 1 saat |
| 9 | Debounce | Performans | 30 dk |
| 10 | Takip Et | Feature | 1 saat |
