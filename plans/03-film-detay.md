# Plan: Film Detay

## Rol
Next.js 14 (App Router) ve TypeScript konusunda deneyimli, dinamik route'lar
ve Supabase entegrasyonu konusunda tecrübeli bir frontend mühendisi.

## Hedef
Tek bir filmin TMDB'den gelen detaylı bilgilerini ve CineEsprit'in kendi
küratöryel notlarını/kullanıcı etkileşimlerini (izlendi işaretleme, favorilere
ekleme) gösteren dinamik bir detay sayfası (`app/films/[id]/page.tsx`)
oluşturmak.

## Beklentiler
- Film posteri, başlığı (Georgia italic), açıklaması, yönetmen, oyuncular, süre, tür, yıl (monospace metadata)
- Fragman linki (varsa TMDB videos endpoint'i)
- Benzer/önerilen filmler şeridi
- Kullanıcı oturum açmışsa: "izledim" işaretleme ve favorilere ekleme aksiyonları (Supabase'e yazar)
- Geçersiz/var olmayan film ID'si için 404 sayfası

## Teknik Kararlar
- Sayfa: `app/films/[id]/page.tsx`, Server Component; `generateMetadata` ile SEO başlık/açıklama
- Film detay verisi: `lib/tmdb.ts` içine `getFilmDetails(id)` ve `getSimilarFilms(id)` eklenir
- Kullanıcı etkileşim verisi (izlendi/favori): Supabase `watch_history` tablosu, `lib/supabase/server.ts` ile okunur
- "İzledim" / "Favorile" butonları interaktif olduğu için `components/FilmActions.tsx` (`"use client"`) — Server Action'lar (`app/films/[id]/actions.ts`) ile Supabase'e yazar
- Bulunamayan film için `notFound()` çağrısı, `app/films/[id]/not-found.tsx`
- Stil: Tailwind, design system; detay sayfası geniş hero görsel + iki sütunlu içerik düzeni

## İlerleme Adımları
1. `lib/tmdb.ts` içine `getFilmDetails`, `getSimilarFilms`, `getFilmVideos` fonksiyonlarını ekle
2. Supabase'de `watch_history` ve `favorites` tablo şemalarını doğrula/oluştur
3. `app/films/[id]/actions.ts` içinde "izledim" ve "favorile" Server Action'larını yaz
4. `components/FilmActions.tsx` client component'ini oluştur (oturum durumuna göre buton state'i)
5. `app/films/[id]/page.tsx` sayfasını oluştur: TMDB verisi + Supabase kullanıcı verisi paralel çekilir
6. `generateMetadata` ile dinamik SEO meta etiketlerini ekle
7. `app/films/[id]/not-found.tsx` oluştur
8. Geçersiz ID, oturumsuz kullanıcı ve oturumlu kullanıcı senaryolarını test et

## Doğrulama Kriterleri
- Geçerli bir TMDB film ID'si ile sayfa açıldığında gerçek başlık, poster, oyuncu kadrosu görünüyor
- Geçersiz ID'de 404 sayfası dönüyor (500 değil)
- Oturum açmış kullanıcı "izledim" işaretlediğinde Supabase `watch_history` tablosuna satır ekleniyor (manuel doğrulama: Supabase tablosunda kayıt görünüyor)
- Benzer filmler şeridinde en az 4 öneri TMDB'den geliyor
- `generateMetadata` ile sayfa `<title>` etiketi filmin adını içeriyor
- Lighthouse Performance skoru 85+, Accessibility skoru 90+
- Mobil ve masaüstünde düzen bozulmuyor
- Yalnızca `FilmActions.tsx` client component

## Beklenen Çıktı
- `app/films/[id]/page.tsx`, `app/films/[id]/not-found.tsx`, `app/films/[id]/actions.ts`
- `components/FilmActions.tsx`
- `lib/tmdb.ts` içinde detay/benzer film fonksiyonları
- Supabase `watch_history`/`favorites` tablolarıyla entegre çalışan bir detay sayfası
