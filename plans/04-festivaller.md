# Plan: Festival Takvimi

## Rol
Next.js 14 (App Router) ve TypeScript konusunda deneyimli, takvim/zaman
çizelgesi UX'i ve Supabase veri modellemesi konusunda tecrübeli bir frontend
mühendisi.

## Hedef
Dünya genelindeki bağımsız/auteur film festivallerini tarih sırasına göre
listeleyen, filtrelenebilir bir festival takvimi sayfası
(`app/festivals/page.tsx`) oluşturmak.

## Beklentiler
- Festivaller kronolojik sırada (yaklaşan önce) listelenir
- Her festival kartında: isim, konum/ülke, tarih aralığı (monospace), kısa açıklama, kapak görseli
- Ülke/bölge ve "devam eden / yaklaşan / geçmiş" durumuna göre filtreleme
- Festival kartına tıklayınca detay görünümü (modal veya `app/festivals/[id]/page.tsx`)
- Veri tamamen Supabase'den gelir (TMDB festival verisi sağlamaz)

## Teknik Kararlar
- Sayfa: `app/festivals/page.tsx`, Server Component
- Festival verisi: Supabase `festivals` tablosu, `lib/supabase/server.ts` üzerinden `start_date`'e göre sıralanarak çekilir
- Filtre kontrolleri (bölge, durum): `components/FestivalFilters.tsx` (`"use client"`), URL `searchParams` ile senkronize
- Festival kartı: `components/FestivalCard.tsx` (01-anasayfa planındaki ile aynı bileşen yeniden kullanılır)
- Festival detay: `app/festivals/[id]/page.tsx`, Server Component, `notFound()` ile 404 davranışı
- Tarih hesaplamaları (yaklaşan/devam eden/geçmiş) sunucu tarafında, native `Date` ile yapılır

## İlerleme Adımları
1. Supabase `festivals` tablosu şemasını doğrula (isim, ülke, başlangıç/bitiş tarihi, açıklama, kapak görsel URL'i)
2. `lib/supabase/festivals.ts` içine `getFestivals(filters)` ve `getFestivalById(id)` fonksiyonlarını yaz
3. `components/FestivalFilters.tsx` client component'ini oluştur
4. `app/festivals/page.tsx` sayfasını oluştur: verileri çek, durum etiketini (yaklaşan/devam eden/geçmiş) hesapla, listele
5. `app/festivals/[id]/page.tsx` detay sayfasını oluştur
6. Boş/filtre sonucu olmayan durumları tasarla
7. Farklı tarih aralıklarıyla (geçmiş, bugün, gelecek) test verisi ile doğrula

## Doğrulama Kriterleri
- Festival listesi Supabase'den gerçek veri ile geliyor (en az 3 test kaydıyla doğrulanır)
- Festivaller `start_date`'e göre doğru kronolojik sırada görünüyor
- "Yaklaşan" filtresi yalnızca bugünden sonraki festivalleri gösteriyor
- Festival kartına tıklayınca detay sayfası gerçek veriyle açılıyor
- Geçersiz festival ID'sinde 404 dönüyor
- Mobilde tek sütun, masaüstünde çok sütunlu grid (responsive)
- Lighthouse Performance skoru 85+
- TypeScript derlemesi hatasız geçiyor

## Beklenen Çıktı
- `app/festivals/page.tsx`, `app/festivals/[id]/page.tsx`
- `components/FestivalFilters.tsx`
- `lib/supabase/festivals.ts`
- Supabase verisiyle çalışan, filtrelenebilir bir festival takvimi
