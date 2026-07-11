# CineEsprit — Master Plan

## Genel Hedef
CineEsprit'in 5 temel sayfasını (ana sayfa, listeleme, film detay, festival
takvimi, kullanıcı profili) çalışır, gerçek veriyle beslenen ve deploy
edilebilir hale getirmek.

---

## Bağımlılık Haritası

```
Faz 0: Altyapı
  └── TMDB API kurulumu (lib/tmdb.ts)
  └── Supabase client (lib/supabase/server.ts)
  └── Supabase tablo şemaları (festivals, watch_history, favorites)
  └── Shared componentler (NavBar, FilmCard, FilmStrip, FestivalCard)
       │
       ▼
Faz 1: 01-anasayfa   ← shared component'lerin ilk kullanım yeri
       │
       ▼
Faz 2: 02-listeleme  ← FilmCard ve lib/tmdb.ts genişletilir
       │
       ▼
Faz 3: 03-film-detay ← lib/tmdb.ts genişletilir, Supabase write (watch_history, favorites)
       │
       ▼
Faz 4: 04-festivaller ← lib/supabase/festivals.ts, FestivalCard yeniden kullanılır
       │
       ▼
Faz 5: 05-profil     ← tüm Supabase tabloları ve lib/tmdb.ts hazır olduğunda anlam kazanır
```

---

## Faz 0 — Ortak Altyapı

**Bu adımlar tüm planlardan önce tamamlanmalıdır.**

### 0.1 Ortam Değişkenleri
- `.env.local`'e `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` eklenir (✓ tamamlandı)
- `TMDB_API_KEY` ve `TMDB_BASE_URL` eklenir

### 0.2 TMDB API İstemcisi
- Dosya: `lib/tmdb.ts`
- İçerik: `fetchTMDB` temel fonksiyonu + `getFeaturedFilms`, `searchFilms`, `discoverFilms`, `getFilmDetails`, `getSimilarFilms`, `getFilmVideos`
- `next.config.js`'e TMDB image CDN domain'i eklenir (`image.tmdb.org`)

### 0.3 Supabase Server Client
- Dosya: `lib/supabase/server.ts`
- `@supabase/supabase-js` ile server-side client (✓ paket kurulu)

### 0.4 Supabase Tablo Şemaları
Supabase Dashboard'da oluşturulacak tablolar:

| Tablo | Sütunlar |
|-------|----------|
| `festivals` | id, name, country, location, start_date, end_date, description, cover_url |
| `watch_history` | id, user_id, film_id (TMDB), watched_at |
| `favorites` | id, user_id, film_id (TMDB), created_at |

### 0.5 Shared Componentler
- `components/NavBar.tsx` — tüm sayfalarda kullanılır
- `components/FilmCard.tsx` — listeleme, benzer filmler, profil önerileri
- `components/FilmStrip.tsx` — ana sayfa ve profil önerileri şeridi
- `components/FestivalCard.tsx` — ana sayfa ve festival takvimi

---

## Faz 1 — Ana Sayfa ✅ TAMAMLANDI (2026-07-04)
**Dosya:** `plans/01-anasayfa.md`

**Özet:** Hero alanında öne çıkan film, film şeridi ve yaklaşan festivaller. Tüm shared component'lerin ilk entegrasyon noktası.

**Tamamlanan Çıktılar:**
- `app/page.tsx` — Server Component, Promise.all ile paralel veri çekme
- `components/NavBar.tsx` — sticky header, logo + nav linkleri
- `components/HeroFeatured.tsx` — backdrop görseli, gradient overlay, CTA butonu
- `components/FilmStrip.tsx` — yatay scroll şeridi, SectionTitle + FilmCard entegrasyonu
- `components/FestivalCard.tsx` — durum badge'i (devam ediyor/yaklaşıyor/sona erdi)
- `lib/supabase/festivals.ts` — getUpcomingFestivals() sorgusu
- `.claude/launch.json` — Node 20 ile preview sunucusu

**Doğrulama:**
- ✅ TMDB'den gerçek film verisi (Esaretin Bedeli, Baba, Schindler'in Listesi vb.)
- ✅ 3 film şeridi: Öne Çıkanlar, Auteur, Bağımsız
- ✅ TypeScript (`tsc --noEmit`) sıfır hata
- ✅ Server Component — hiçbir `"use client"` yok
- ⚠️ Festivaller: Supabase `festivals` tablosu henüz doldurulmadı (festival kartları gizli — Faz 4'te ele alınacak)

---

## Faz 2 — Film Listeleme ve Arama ✅ TAMAMLANDI (2026-07-04)
**Dosya:** `plans/02-listeleme.md`

**Özet:** TMDB arama ve discover endpoint'leri, URL tabanlı filtre/arama state'i, film grid'i.

**Tamamlanan Çıktılar:**
- `app/films/page.tsx` — Server Component, searchParams ile URL-tabanlı state
- `components/FilmFilters.tsx` — "use client"; arama (debounced 400ms), tür/yıl/dil select'leri, "Filtreleri Temizle"
- `lib/tmdb/client.ts` içine `discoverFilms()` eklendi — query varsa search, yoksa discover endpoint'i
- Pagination: önceki/sonraki sayfa linkleri, URL ile senkron
- Boş durum: "Sonuç Yok" + filtreleri temizle linki

**Doğrulama:**
- ✅ "kurosawa" araması gerçek Kurosawa filmleri getiriyor
- ✅ Arama state URL'e yansıyor (?q=kurosawa)
- ✅ TypeScript sıfır hata
- ✅ Yalnızca FilmFilters.tsx "use client" — sayfa ve kartlar server component

---

## Faz 3 — Film Detay ✅ TAMAMLANDI (2026-07-05)
**Dosya:** `plans/03-film-detay.md`

**Tamamlanan Çıktılar:**
- `app/films/[id]/page.tsx` — generateMetadata + paralel TMDB/Supabase veri çekme
- `app/films/[id]/not-found.tsx` — 404 sayfası (geçersiz ID → "Film bulunamadı")
- `app/films/[id]/actions.ts` — toggleWatched / toggleFavorite Server Actions
- `components/FilmActions.tsx` — "use client"; optimistik toggle butonları
- `lib/tmdb/client.ts` — getFilmDetails (append credits+videos), getSimilarFilms, getTrailerKey
- `lib/tmdb/types.ts` — TMDBCredits, TMDBCastMember, TMDBCrewMember, TMDBVideo tipleri
- `lib/supabase/interactions.ts` — isInWatchHistory, isInFavorites

**Doğrulama:**
- ✅ /films/238 (Baba) → Francis Ford Coppola, Marlon Brando kadrosu, Fragmanı İzle butonu, Benzer Filmler
- ✅ /films/999999999 → 404 "Film bulunamadı" sayfası (500 değil)
- ✅ TypeScript sıfır hata
- ✅ Oturumsuz kullanıcı → "Etkileşim için giriş yap" mesajı
- ⚠️ watch_history / favorites Supabase tabloları henüz oluşturulmadı — Server Actions'lar hazır, tablo oluşturunca çalışır

---

## Faz 4 — Festival Takvimi ✅ TAMAMLANDI (2026-07-05)
**Dosya:** `plans/04-festivaller.md`

**Tamamlanan Çıktılar:**
- `app/festivals/page.tsx` — durum/ülke filtresi, gruplu liste (Devam Ediyor / Yaklaşıyor / Geçmiş)
- `app/festivals/[id]/page.tsx` — cover görseli, tarih, konum, açıklama, durum badge'i
- `app/festivals/[id]/not-found.tsx` — 404 sayfası
- `components/FestivalFilters.tsx` — "use client"; durum + ülke dropdown'ları, URL senkron
- `lib/supabase/festivals.ts` — getFestivals(filters), getFestivalById, getFestivalCountries, getUpcomingFestivals

**Doğrulama:**
- ✅ /festivals → "Henüz festival eklenmemiş" boş durum (Supabase tablosu dolduğunda otomatik görünür)
- ✅ /festivals/00000000-... → "Festival bulunamadı" 404 sayfası
- ✅ TypeScript sıfır hata
- ✅ Yalnızca FestivalFilters.tsx "use client"
- ⚠️ `festivals` Supabase tablosuna gerçek veri girilmeli — SQL şeması PROJECT_STATUS.md'de mevcut

---

## Faz 5 — Kullanıcı Profili ve Öneriler ✅ TAMAMLANDI (2026-07-05)
**Dosya:** `plans/05-profil.md`

**Tamamlanan Çıktılar:**
- `app/profile/page.tsx` — oturum koruması (→ `/auth`), izleme geçmişi, favoriler, öneri şeridi
- `lib/supabase/profile.ts` — `getUserProfile`, `getWatchHistory`, `getFavorites`
- `lib/recommendations.ts` — tür-frekans hesaplama + TMDB `discoverFilms` entegrasyonu

**Doğrulama:**
- ✅ `/profile` → 307 → `/auth` (oturumsuz kullanıcı yönlendirmesi)
- ✅ TypeScript sıfır hata
- ✅ Server Component; `"use client"` yok
- ⚠️ `watch_history` / `favorites` / `festivals` Supabase tabloları oluşturulmalı — kod hazır, tablo oluşturunca tüm etkileşimler çalışır
- ⚠️ `/auth` (giriş) sayfası bu plan kapsamı dışında — sonraki adım

---

## Faz 6 — Auth ✅ TAMAMLANDI (2026-07-05)

**Tamamlanan Çıktılar:**
- `app/auth/page.tsx` — split-screen tasarım (sol editöryal panel, sağ form); oturum açıksa → `/profile`
- `app/auth/actions.ts` — `signInWithEmail`, `signUpWithEmail`, `signInWithGoogle` Server Actions
- `app/auth/callback/route.ts` — OAuth code exchange → `/profile`
- `app/auth/signout/route.ts` — POST → sign out → `/auth`
- `components/AuthForm.tsx` — "use client"; GİRİŞ/KAYIT OL tab switch, hata/başarı banner'ları, Google butonu
- `components/NavBar.tsx` güncellendi — async Server Component; oturum açıksa kullanıcı adı + yeşil nokta, kapalıysa "Giriş Yap" linki

**Doğrulama:**
- ✅ `/auth` → tasarıma uygun split-screen giriş formu
- ✅ NavBar oturum durumuna göre dinamik ("GİRİŞ YAP" ↔ kullanıcı adı)
- ✅ `/profile` → 307 → `/auth` (oturumsuz yönlendirme)
- ✅ TypeScript sıfır hata

---

## Genel Başarı Kriterleri

| Kriter | Ölçüt |
|--------|-------|
| Tüm sayfalar açılıyor | `npm run dev` altında 5 route'ta da 200 yanıtı |
| TypeScript derlemesi | `tsc --noEmit` sıfır hata |
| Supabase bağlantısı | `/api/test-supabase` → `"success": true` (✓ doğrulandı) |
| TMDB bağlantısı | Ana sayfada gerçek film posteri ve başlığı görünüyor |
| Responsive | 375px ve 1440px'te tüm sayfalarda düzen bozulmuyor |
| Lighthouse | Her sayfada Performance 85+, Accessibility 90+ |
| Server Component önceliği | `"use client"` yalnızca form/etkileşim gerektiren bileşenlerde |

---

## Uygulama Sırası Özeti

| Sıra | Faz | Plan Dosyası |
|------|-----|-------------|
| 1 | Altyapı (TMDB, Supabase, shared component'ler) | Faz 0 |
| 2 | Ana Sayfa | `01-anasayfa.md` |
| 3 | Film Listeleme ve Arama | `02-listeleme.md` |
| 4 | Film Detay | `03-film-detay.md` |
| 5 | Festival Takvimi | `04-festivaller.md` |
| 6 | Kullanıcı Profili ve Öneriler | `05-profil.md` |
