# CineEsprit

## Amaç
Bağımsız sinema, auteur ve deneysel filmler ile dünya genelindeki film festivalleri için niş bir platform.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase

## Design System
- Zemin: `#0a0a0a`
- Kart/panel: `#141414`
- Tek vurgu rengi: `#d8ff3e`
- Başlıklar: Georgia italic
- Gövde: sade sans-serif
- Üst-veri (metadata): monospace
- Komponentler köşeli (pill/rounded-full kullanılmaz)

## Kod Kuralları
- Her component TypeScript ile yazılır
- Stiller Tailwind ile yapılır
- Server Component tercih edilir; zorunlu olmadıkça `"use client"` kullanılmaz

## Klasör Yapısı
- `app/` — sayfalar
- `components/` — UI komponentleri
- `lib/` — Supabase client ve yardımcı fonksiyonlar

## Veri Kaynakları
- TMDB API (film verisi)
- Supabase (kullanıcı, izleme geçmişi, festival verisi, curation katmanı)
