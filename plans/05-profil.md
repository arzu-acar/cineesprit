# Plan: Kullanıcı Profili ve Öneriler

## Rol
Next.js 14 (App Router) ve TypeScript konusunda deneyimli, Supabase Auth ve
kişiselleştirilmiş öneri mantığı konusunda tecrübeli bir frontend mühendisi.

## Hedef
Kullanıcının kendi izleme geçmişini, favorilerini görebildiği ve bu verilere
dayalı film önerileri aldığı bir profil sayfası (`app/profile/page.tsx`)
oluşturmak.

## Beklentiler
- Kullanıcı bilgisi (isim/e-posta, üyelik tarihi)
- İzleme geçmişi listesi (poster + film adı + izlenme tarihi, monospace)
- Favori filmler listesi
- İzleme geçmişine dayalı basit bir "Sana Özel Öneriler" şeridi (örn. en çok izlenen türe göre TMDB discover sorgusu)
- Oturum açmamış kullanıcı profil sayfasına eriştiğinde giriş sayfasına yönlendirilir

## Teknik Kararlar
- Sayfa: `app/profile/page.tsx`, Server Component; oturum kontrolü sunucu tarafında yapılır, yoksa `redirect("/login")`
- Kullanıcı/izleme/favori verisi: Supabase `users`, `watch_history`, `favorites` tabolarından `lib/supabase/server.ts` ile çekilir
- Öneri mantığı: `lib/recommendations.ts` — izleme geçmişindeki en sık geçen türü hesaplar, TMDB `discoverFilms({ genre })` ile öneri listesi üretir (basit kural tabanlı, ML değil)
- Profil düzenleme (isim değiştirme vb.) gerekiyorsa `components/ProfileEditForm.tsx` (`"use client"`) + Server Action
- Giriş/çıkış akışı bu planın kapsamı dışında varsayılır (mevcut Supabase Auth altyapısı kullanılır)
- Stil: Tailwind, design system; üç bölümlü düzen (kullanıcı bilgisi, geçmiş/favoriler, öneriler)

## İlerleme Adımları
1. Supabase `users`, `watch_history`, `favorites` tablo şemalarını doğrula
2. `lib/supabase/profile.ts` içine `getUserProfile`, `getWatchHistory`, `getFavorites` fonksiyonlarını yaz
3. `lib/recommendations.ts` içinde tür-frekans hesaplama ve TMDB discover entegrasyonunu yaz
4. `app/profile/page.tsx` sayfasını oluştur: oturum kontrolü + paralel veri çekme + bölümleri render et
5. İzleme geçmişi ve favoriler için `components/FilmCard.tsx` bileşenini yeniden kullan (liste görünümünde)
6. Öneri şeridini `components/FilmStrip.tsx` ile render et
7. Boş geçmiş/favori durumlarını tasarla (örn. "Henüz film izlemediniz")
8. Oturumsuz erişim, boş geçmiş ve dolu geçmiş senaryolarını test et

## Doğrulama Kriterleri
- Oturum açmamış kullanıcı `/profile`'a gittiğinde `/login`'e yönlendiriliyor
- Oturum açmış test kullanıcısının izleme geçmişi Supabase'den gerçek veri olarak listeleniyor
- Favori filmler listesi Supabase'deki `favorites` kayıtlarıyla birebir eşleşiyor
- En az 3 farklı türde izleme geçmişi olan test kullanıcısı için öneri şeridi, geçmişteki ağırlıklı türe uygun TMDB filmleri gösteriyor
- Boş geçmiş durumunda anlamlı bir boş durum mesajı görünüyor
- Mobil ve masaüstünde düzen bozulmuyor
- Lighthouse Performance skoru 85+
- TypeScript derlemesi hatasız geçiyor

## Beklenen Çıktı
- `app/profile/page.tsx`
- `lib/supabase/profile.ts`, `lib/recommendations.ts`
- (gerekirse) `components/ProfileEditForm.tsx`
- Supabase verisiyle çalışan, kişiselleştirilmiş öneriler sunan bir profil sayfası
