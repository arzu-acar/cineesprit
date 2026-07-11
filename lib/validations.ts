import { z } from "zod";

export const FestivalSchema = z.object({
  name: z.string().min(1, "Festival adı zorunlu").max(200),
  country: z.string().min(1, "Ülke zorunlu").max(100),
  location: z.string().min(1, "Konum zorunlu").max(200),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Geçerli bir tarih giriniz"),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Geçerli bir tarih giriniz"),
  description: z.string().max(2000).optional(),
  cover_url: z
    .string()
    .max(500)
    .refine((v) => !v || v.startsWith("https://"), {
      message: "URL https:// ile başlamalı",
    })
    .optional(),
});

export const CurateFilmSchema = z.object({
  tmdb_id: z
    .string()
    .regex(/^\d+$/, "Geçerli bir TMDB ID giriniz")
    .transform(Number),
  curator_note: z.string().max(1000).optional(),
  tags: z.string().max(500).optional(),
  featured: z.boolean().optional(),
});

export const AuthSchema = z.object({
  email: z.string().email("Geçerli bir e-posta giriniz").max(254),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı").max(128),
});
