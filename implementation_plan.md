# Yazocial V2 - Gelişmiş Özellikler Uygulama Planı

Bu plan, Yazocial platformunu standart bir MERN uygulamasından çıkarıp, tam teşekküllü, etkileşimli ve gerçek zamanlı bir sosyal geliştirici platformuna dönüştürmek için hazırlanmıştır.

## User Review Required

> [!WARNING]
> Bu planda yer alan özellikler ciddi veritabanı ve mimari değişiklikleri içerebilir. Tüm özellikleri tek bir seferde yapmak yerine, aşamalar (Faz) halinde ilerlememiz hata riskini azaltacaktır. Lütfen öncelik sırasını onaylayın veya değiştirmek istediğiniz kısımları belirtin.

## Open Questions

> [!IMPORTANT]
> 1. **Görsel Yükleme (Media Upload):** Görselleri sunucuda (yerel klasörde) mi tutalım, yoksa daha profesyonel bir çözüm olan **Cloudinary** (ücretsiz bulut depolama) mi kullanalım? Cloudinary tavsiye edilir.
> 2. **Gerçek Zamanlı İletişim:** Socket.io eklendiğinde sunucu kaynak tüketimi artacaktır. V2 yayına alındığında sunucu kapasitesinin (RAM/CPU) yeterli olacağından emin miyiz?

---

## Proposed Changes (Aşama Aşama Plan)

### FAZ 1: Kullanıcı Etkileşimi (Kaydedilenler ve Editör)

Kullanıcıların platformda daha uzun süre vakit geçirmesini sağlayacak kolay ama etkili geliştirmeler.

#### [NEW] `api/db/models/Bookmarks.js`
- Kullanıcıların soru ve makaleleri kaydedebilmesi için yeni veritabanı şeması eklenecek.

#### [NEW] `api/routes/bookmarks.js`
- `POST /api/bookmarks`, `GET /api/bookmarks` ve `DELETE /api/bookmarks/:id` uç noktaları (endpoints) yazılacak.

#### [MODIFY] `client/src/pages/QuestionDetail.jsx` & `Home.jsx`
- Kartlara ve detay sayfasına "Kaydet" (Bookmark) butonu eklenecek.
- Soru/Makale ekleme alanlarındaki standart `<textarea>` yapıları, `react-simplemde-editor` veya benzeri bir Markdown editörü ile değiştirilecek.

---

### FAZ 2: Medya Yönetimi (Görsel Yükleme)

Sadece link vermek yerine, kullanıcıların kendi ekran görüntülerini platforma yükleyebilmesi.

#### [MODIFY] `api/package.json`
- `multer` ve (kabul edilirse) `cloudinary` paketleri eklenecek.

#### [NEW] `api/middleware/upload.js`
- Gelen görselleri işleyecek, boyutunu küçültecek ve sunucuya/buluta aktaracak middleware yazılacak.

#### [NEW] `api/routes/upload.js`
- `POST /api/upload` rotası oluşturulacak. Frontend buraya dosya yollayacak, backend ise dosyanın URL'ini geri dönecek.

#### [MODIFY] `client/src/pages/CreateArticle.jsx` & `AskQuestion.jsx`
- Sürükle-Bırak veya dosya seçici arayüzü eklenecek.

---

### FAZ 3: Gerçek Zamanlı Bildirimler (Socket.io)

Platformun canlı hissettirmesi için en önemli adım.

#### [MODIFY] `api/index.js` (veya `server.js`)
- Express sunucusuna `socket.io` entegrasyonu yapılacak.
- Kullanıcıların soket bağlantıları (User ID -> Socket ID eşleşmesi) hafızada tutulacak.

#### [MODIFY] `api/routes/answers.js` & `api/routes/votes.js`
- Yeni bir cevap eklendiğinde veya oy verildiğinde, içerik sahibine Socket.io üzerinden "Gerçek Zamanlı" event (olay) fırlatılacak.

#### [NEW] `client/src/context/SocketContext.jsx`
- Frontend tarafında Socket bağlantısını tüm uygulamanın kullanabileceği bir Context yapısı kurulacak.

#### [MODIFY] `client/src/layouts/MainLayout.jsx`
- Sağ üstteki veya soldaki bildirim zili, yeni bir soket olayı geldiğinde kırmızı bir nokta ile yanıp sönecek (veya `react-hot-toast` ile ekrana popup düşecek).

---

### FAZ 4: SEO ve Performans

Sitenin Google aramalarında çıkması için iyileştirmeler.

#### [MODIFY] `client/package.json`
- `react-helmet-async` eklenecek.

#### [MODIFY] Tüm Sayfalar (Pages)
- Her sayfanın tepesine `<Helmet>` bileşeni eklenip; dinamik `<title>`, `<meta name="description">` etiketleri yerleştirilecek.
- Özellikle `QuestionDetail.jsx` ve `ArticleDetail.jsx` içinde sayfa başlığı sorunun kendi başlığı olacak şekilde ayarlanacak.

---

## Verification Plan

### Automated Tests
- Postman veya VSCode Rest Client kullanılarak yeni `bookmarks` ve `upload` rotaları test edilecek.
- Socket bağlantısı izole test dosyalarıyla doğrulanacak.

### Manual Verification
- Ayrı iki tarayıcı penceresi (birinde User A, diğerinde User B) açılarak; User A, User B'nin sorusuna cevap verdiğinde User B'nin ekranına anında bildirim düşüp düşmediği test edilecek.
- Cloudinary veya yerel yükleme kullanılarak, resim yükleme formunun hatasız URL dönüp dönmediği kontrol edilecek.
- `react-helmet` çıktıları tarayıcı dev-tools "Elements" sekmesindeki `<head>` kısmından incelenecek.
