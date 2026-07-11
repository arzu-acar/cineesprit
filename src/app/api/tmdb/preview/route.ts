import { NextResponse } from "next/server";
import { getFilmDetails, tmdbImageUrl } from "@lib/tmdb/client";
import { createSupabaseServerClient } from "@lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
  }

  try {
    const film = await getFilmDetails(id);
    return NextResponse.json({
      title: film.title,
      year: film.release_date?.slice(0, 4) ?? "",
      poster: film.poster_path ? tmdbImageUrl(film.poster_path, "w92") : null,
    });
  } catch {
    return NextResponse.json({ error: "Film bulunamadı" }, { status: 404 });
  }
}
