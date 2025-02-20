# Admin Panel Planı

## 1. Giriş

Bu belge, Oxford 3000 kelime öğrenme uygulamasının admin panel geliştirme planını içerir. Admin panel, uygulamanın yönetim ve izleme işlevlerini sağlayacaktır.

## 2. UI/UX Tasarım Planı

### 2.1 Admin Login Ekranı 
- Modern ve minimalist tasarım 
- Mevcut uygulamanın bs-navy, bs-primary renk şemasını kullanma 
- Özellikler:
  - Email/şifre girişi 
  - "Beni Hatırla" seçeneği 
  - Şifremi Unuttum fonksiyonu 
  - Güvenlik doğrulaması (2FA desteği) 

*Not: Login sayfası temel özellikleriyle tamamlandı (18.02.2024). 2FA desteği ilerleyen aşamalarda eklenecek.*

### 2.2 Admin Dashboard
- Üst Bölüm:
  - Uygulama logosu
  - Admin profil menüsü
  - Bildirim merkezi
  - Hızlı istatistik kartları: 
    - Toplam kullanıcı sayısı 
    - Günlük aktif kullanıcı 
    - Toplam öğrenilen kelime sayısı 
    - Ortalama başarı oranı 

- Sol Menü:
  - Dashboard 
  - Kullanıcı Yönetimi
  - Kelime Yönetimi
  - Quiz Yönetimi
  - İstatistikler 
  - Sistem Ayarları

*Not: Dashboard temel özellikleriyle tamamlandı (18.02.2024). İstatistik kartları ve aktivite grafiği eklendi.*

### 2.3 Ana Modüller

#### 2.3.1 Kullanıcı Yönetimi
- Kullanıcı listesi (filtreleme ve arama) ✅
  - İsim ve email ile arama ✅
  - Rol ve durum filtreleme ✅
  - Sayfalama ve sıralama 🔄
- Kullanıcı detay görünümü:
  - Profil bilgileri ✅
  - Öğrenme istatistikleri ✅
  - Quiz sonuçları ✅
  - Aktivite geçmişi ✅
- Kullanıcı hesap işlemleri:
  - Hesap dondurma/aktifleştirme ✅
  - Şifre sıfırlama ✅
  - Rol atama ✅

*Not: Kullanıcı yönetimi temel özellikleriyle tamamlandı (18.02.2024). Sayfalama ve sıralama özellikleri eklenecek.*

#### 2.3.2 Kelime Yönetimi
- Kelime listesi (filtreleme ve arama) ✅
  - Kelime ve çeviri ile arama ✅
  - Seviye ve kategori filtreleme ✅
  - Sayfalama ve sıralama 🔄
- Kelime detayları:
  - Temel bilgiler (kelime, çeviri, seviye) ✅
  - Örnek cümleler ✅
  - Ses dosyaları ✅
  - Görsel medya ✅
- Toplu işlemler:
  - İçe/dışa aktarma ✅
  - Kategori yönetimi ✅
  - Toplu düzenleme ✅

*Not: Kelime yönetimi temel özellikleriyle tamamlandı (18.02.2024). Sayfalama ve sıralama özellikleri eklenecek.*

#### 2.3.3 Quiz Yönetimi
- Quiz şablonları ✅
  - Günlük quizler ✅
  - Haftalık quizler ✅
  - Seviye quizleri ✅
  - Özel quizler ✅
- Quiz özellikleri:
  - Kelime sayısı ayarı ✅
  - Süre sınırı ✅
  - Zorluk seviyesi ✅
  - Soru tipleri ✅
- Quiz istatistikleri:
  - Katılım oranları ✅
  - Başarı ortalamaları ✅
  - Zorluk analizi ✅

*Not: Quiz yönetimi temel özellikleriyle tamamlandı (18.02.2024). Quiz oluşturma ve düzenleme formları eklenecek.*

#### 2.3.4 İstatistikler ve Raporlar
- Genel kullanım istatistikleri
- Öğrenme performans grafikleri
- Kullanıcı aktivite raporları
- Özel rapor oluşturma

#### 2.3.5 Sistem Ayarları
- Genel Ayarlar ✅
  - Uygulama adı ✅
  - Dil seçenekleri ✅
  - Tema ayarları ✅
- Güvenlik Ayarları ✅
  - 2FA yapılandırması ✅
  - Oturum yönetimi ✅
  - Şifre politikaları ✅
- Bildirim Ayarları ✅
  - Email bildirimleri ✅
  - Sistem bildirimleri ✅
- Yedekleme ve Bakım ✅
  - Otomatik yedekleme ✅
  - Veri temizleme ✅
  - Sistem durumu ✅

*Not: Sistem ayarları temel özellikleriyle tamamlandı (18.02.2024). API entegrasyonu eklenecek.*

### 2.4 Tasarım Detayları

#### Renk Şeması
- Ana Renkler:
  - Primary: bs-primary (Mevcut tema)
  - Secondary: bs-navy (Mevcut tema)
  - Accent: bs-800 (Mevcut tema)
- Nötr Renkler:
  - Background: #FFFFFF
  - Text: bs-navygri
  - Border: bs-100

#### Tipografi
- Font: Inter (Mevcut tema)
- Başlıklar: 
  - H1: 24px, bold
  - H2: 20px, semibold
  - H3: 18px, semibold
- Body text: 14px, regular
- Small text: 12px, regular

#### Bileşenler
- Butonlar:
  - Primary: Gradient (bs-primary to bs-800)
  - Secondary: White with bs-primary border
  - Danger: Red gradient
- Input alanları:
  - Rounded-xl
  - Light shadow
  - Focus state with bs-primary ring
- Kartlar:
  - White background
  - Soft shadow
  - Rounded corners
- Tablolar:
  - Zebra striping
  - Hover states
  - Sortable headers

## 3. Geliştirme Aşamaları

### Faz 1: Temel Altyapı
1. Admin panel route yapısı
2. Auth sistemi
3. Layout tasarımı
4. Temel bileşenlerin geliştirilmesi

### Faz 2: Ana Modüller
1. Dashboard
2. Kullanıcı yönetimi
3. Kelime yönetimi
4. Quiz yönetimi

### Faz 3: İstatistikler ve Raporlama
1. İstatistik modülleri
2. Raporlama sistemi
3. Grafik ve görselleştirmeler

### Faz 4: Gelişmiş Özellikler
1. Toplu işlem araçları
2. Export/Import özellikleri
3. Gelişmiş arama ve filtreleme
4. Otomatik raporlama

## 4. Güvenlik Önlemleri
- Role-based access control (RBAC)
- İki faktörlü doğrulama (2FA)
- Session yönetimi
- Aktivite logları
- IP bazlı erişim kontrolü

## 5. Performans Optimizasyonları
- Lazy loading
- Pagination
- Önbellek mekanizmaları
- API rate limiting
- Veri optimizasyonu

## 6. Test Stratejisi
- Unit testler
- Integration testler
- E2E testler
- Performans testleri
- Güvenlik testleri
