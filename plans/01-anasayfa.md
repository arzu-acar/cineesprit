# Plan: Ana Sayfa

## Rol
Next.js 14 (App Router) ve TypeScript konusunda deneyimli, Tailwind CSS ile
CineEsprit'in karanlık/sade tasarım dilini uygulayan bir frontend mühendisi.

## Hedef
Ziyaretçiyi karşılayan, platformun editöryel kimliğini (bağımsız sinema,
auteur ve deneysel film odaklı küratörlük) yansıtan, öne çıkan filmleri ve
yaklaşan festivalleri sergileyen bir ana sayfa (`app/page.tsx`) oluşturmak.

## Beklentiler
- Hero alanında öne çıkan/curation tarafından seçilmiş 1 film (büyük görsel + başlık + kısa açıklama)
- "Bu Hafta Öne Çıkanlar" gibi bir film şeridi (yatay scroll veya grid)
- Yaklaşan festivallerden 3-4 tanesinin özet kartları
- Üst navigasyon (logo, listeleme, festivaller, profil linkleri)
- Tamamen Server Component; veri TMDB ve Supabase'den sunucu tarafında çekilir
- Mobil ve masaüstünde okunabilir, responsive düzen

## Teknik Kararlar
- Sayfa: `app/page.tsx`, Server Component (`"use client"` kullanılmaz)
- Film verisi: TMDB API'den `lib/tmdb.ts` üzerinden çekilir (popüler/öne çıkan endpoint'i + curation listesi ile filtrelenir)
- Festival verisi: Supabase `festivals` tablosundan `lib/supabase/server.ts` client'ı ile çekilir
- Bileşenler: `components/HeroFeatured.tsx`, `components/FilmStrip.tsx`, `components/FestivalCard.tsx`, `components/NavBar.tsx`
- Stil: Tailwind, zemin `#0a0a0a`, kartlar `#141414`, vurgu `#d8ff3e`; başlıklar Georgia italic, gövde sans-serif, tarih/metadata monospace; köşeli komponentler (rounded yok)
- Görseller `next/image` ile, TMDB image CDN domain'i `next.config.js`'e eklenir

## İlerleme Adımları
1. `lib/tmdb.ts` içine TMDB fetch fonksiyonlarını yaz (API key `.env.local`'den)
2. `lib/supabase/server.ts` içinde sunucu tarafı Supabase client'ını oluştur
3. `components/NavBar.tsx`, `components/HeroFeatured.tsx`, `components/FilmStrip.tsx`, `components/FestivalCard.tsx` bileşenlerini oluştur
4. `app/page.tsx` içinde verileri paralel `Promise.all` ile çek ve bileşenleri birleştir
5. Tailwind ile design system renklerini ve tipografisini uygula
6. Responsive davranışı (mobil tek sütun, masaüstü grid) test et
7. Lighthouse ve manuel tarayıcı testi yap

## Doğrulama Kriterleri
- Sayfa `npm run dev` ile hatasız açılıyor
- Hero bölümünde TMDB'den gerçek bir film verisi (poster, başlık, açıklama) görüntüleniyor
- En az 3 yaklaşan festival Supabase'den gerçek veri olarak listeleniyor
- Lighthouse Performance skoru 90+, Accessibility skoru 90+
- 375px (mobil) ve 1440px (masaüstü) genişliklerde düzen bozulmuyor
- Hiçbir component'te gereksiz `"use client"` kullanılmıyor
- TypeScript derlemesi (`tsc --noEmit`) hatasız geçiyor

## Beklenen Çıktı
- `app/page.tsx`
- `components/NavBar.tsx`, `components/HeroFeatured.tsx`, `components/FilmStrip.tsx`, `components/FestivalCard.tsx`
- `lib/tmdb.ts`, `lib/supabase/server.ts`
- Çalışan, TMDB ve Supabase verisiyle beslenen, responsive bir ana sayfa
