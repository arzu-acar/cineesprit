# Plan: Film Listeleme ve Arama

## Rol
Next.js 14 (App Router) ve TypeScript konusunda deneyimli, arama/filtreleme
UX'i ve TMDB API entegrasyonu konusunda tecrübeli bir frontend mühendisi.

## Hedef
Kullanıcının TMDB kataloğundaki bağımsız/auteur/deneysel filmleri arayabildiği,
tür, yıl ve ülke gibi filtrelerle daraltabildiği bir listeleme sayfası
(`app/films/page.tsx`) oluşturmak.

## Beklentiler
- Arama kutusu (film adına göre arama)
- Filtreler: tür, yayın yılı, ülke/dil
- Sonuçlar grid düzeninde, poster + başlık + yıl + tür (monospace metadata) gösterilir
- Sayfalama (pagination) veya "daha fazla yükle" davranışı
- Arama/filtre durumu URL query parametrelerinde tutulur (paylaşılabilir link)
- Sonuç yoksa anlamlı bir boş durum (empty state) gösterilir

## Teknik Kararlar
- Sayfa: `app/films/page.tsx`, Server Component; `searchParams` üzerinden filtre/arama state'i okunur
- Arama inputu ve filtre kontrolleri için minimal bir Client Component (`components/FilmFilters.tsx`, `"use client"`) — yalnızca form etkileşimi için, URL'i `router.push`/`<form>` ile günceller
- Film verisi: `lib/tmdb.ts` içine `searchFilms`, `discoverFilms` fonksiyonları eklenir
- Sonuç grid'i: `components/FilmCard.tsx` (poster, başlık Georgia italic, yıl/tür monospace)
- Pagination: TMDB'nin `page` parametresi, URL query'de tutulur
- Stil: Tailwind, design system renkleri ve köşeli kart yapısı

## İlerleme Adımları
1. `lib/tmdb.ts` içine arama (`search/movie`) ve discover (`discover/movie`) fonksiyonlarını ekle
2. `components/FilmFilters.tsx` client component'ini oluştur (arama kutusu + tür/yıl/ülke select'leri)
3. `components/FilmCard.tsx` ve grid container'ı oluştur
4. `app/films/page.tsx` içinde `searchParams`'ı oku, TMDB'den veri çek, grid'i render et
5. Pagination kontrollerini (önceki/sonraki sayfa) ekle, URL query ile senkronize et
6. Boş sonuç durumunu tasarla
7. Debounce'lu arama davranışını test et (gereksiz istekleri önlemek için)

## Doğrulama Kriterleri
- "kurosawa" gibi bir aramada TMDB'den gerçek sonuçlar dönüyor
- Tür/yıl filtresi uygulandığında sonuç listesi gerçekten değişiyor
- Filtre/arama state'i URL'e yansıyor; sayfa yenilendiğinde aynı sonuçlar geliyor
- Sonuç bulunamayan aramalarda boş durum mesajı gösteriliyor
- Mobilde grid 1-2 sütuna, masaüstünde 4+ sütuna düşüyor (responsive)
- Lighthouse Performance skoru 85+
- TypeScript derlemesi hatasız geçiyor
- Yalnızca `FilmFilters.tsx` client component; sayfa ve kart bileşenleri server component olarak kalıyor

## Beklenen Çıktı
- `app/films/page.tsx`
- `components/FilmFilters.tsx`, `components/FilmCard.tsx`
- `lib/tmdb.ts` içinde arama/discover fonksiyonları
- URL tabanlı, paylaşılabilir, çalışan bir arama/filtreleme deneyimi
