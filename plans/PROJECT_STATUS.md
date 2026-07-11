# CineEsprit — Proje Durumu

**Tarih:** 2026-07-11  
**Dev server:** `http://localhost:3000` (çalışıyor, `/tr` rotası doğrulandı)

---

## ✅ Tamamlananlar

### SEO
- `src/app/[locale]/layout.tsx` — root metadata (metadataBase, og:siteName, title template)
- Her sayfa için `generateMetadata` + `og:url`: home, films, festivals, film detail, festival detail, auth, profile
- `src/app/sitemap.ts` — /tr ve /en prefix'li statik + dinamik (festival) URL'ler
- `src/app/robots.ts` — locale-prefixli allow/disallow kuralları

### i18n (next-intl 4.13.1)
- `next-intl` kuruldu
- `messages/tr.json` + `messages/en.json` oluşturuldu (nav, home, films, filmDetail, festivals, filters, profile, footer, metadata namespace'leri)
- `src/i18n/routing.ts` — locales: ["tr","en"], defaultLocale: "tr"
- `src/i18n/request.ts` — getRequestConfig
- `src/i18n/navigation.ts` — Link, redirect, usePathname, useRouter
- `next.config.ts` — withNextIntl wrapper
- `src/middleware.ts` — next-intl middleware + Supabase auth kombine; x-pathname header set ediliyor

### Sayfa Yapısı
- `src/app/[locale]/layout.tsx` — NextIntlClientProvider, dil-aware html lang
- `src/app/layout.tsx` — minimal root layout (html/body yok)
- Tüm sayfalar src/app/[locale]/ altına taşındı
- API route'lar root'ta kaldı: auth/callback, auth/signout, admin/, api/

### Bileşenler
- NavBar — getTranslations, i18n Link, LocaleSwitcher eklendi
- LocaleSwitcher — yeni client component
- HeroFeatured — editorPick/goToFilm prop, i18n Link
- FilmStrip — seeAllLabel prop eklendi
- FilmFilters — useTranslations("filters")
- FestivalFilters — useTranslations("filters")
- FilmCard — useLocale() ile locale-aware href

### TMDB
- fetchTMDB options'a language eklendi
- tmdbLanguage(locale) helper: tr→tr-TR, en→en-US
- getFeaturedFilms, getFilmsByCategory, discoverFilms, getFilmDetails, getSimilarFilms locale param alıyor

### Server Actions
- lib/locale.ts — getLocaleFromHeaders() (x-pathname header'dan locale okur)
- src/app/auth/actions.ts — locale-aware redirect (canonical)
- src/app/onboarding/actions.ts — locale-aware redirect (canonical)
- src/app/films/actions.ts — revalidatePath /tr ve /en için
- FilmActions.tsx import path düzeltildi

---

## ✅ Test Edildi (2026-07-11)

- `npm run build` — başarılı, hata yok (Node 20 gerekiyor, .nvmrc mevcut)
- `/tr` — Türkçe içerik doğrulandı
- `/en` — İngilizce içerik doğrulandı (window.location.href ile teyit edildi)
- `/tr/films` — film kataloğu çalışıyor (13 film)
- `/tr/films/:id` — film detay sayfası çalışıyor (poster, başlık, meta, yönetmen, oyuncular)
- `/tr/festivals` — festival takvimi çalışıyor (50 festival, durum/ülke filtreleri)

## ❌ Eksik / Kapsam Dışı

- Auth flow locale redirect doğruluğu test edilmedi
- FestivalCard tarih formatı hâlâ tr-TR hardcoded (kapsam dışı bırakılabilir)
- admin/ sayfaları Türkçe (kapsam dışı)

---

## Sonraki Adımlar

1. Auth flow'u test et (giriş → locale-aware redirect)
2. FestivalCard tarih formatı locale'e göre düzelt
3. /en/festivals ve /en/films/:id sayfalarını test et
