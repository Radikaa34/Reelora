
import { NextResponse } from "next/server";

type TMDBShow = {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  overview: string;
  genre_ids?: number[];
};

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key is missing." },
      { status: 500 }
    );
  }

  try {
    const url = new URL(
      "https://api.themoviedb.org/3/discover/tv"
    );

    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("sort_by", "popularity.desc");
    url.searchParams.set("include_adult", "false");
    url.searchParams.set("without_genres", "16");
    url.searchParams.set("vote_count.gte", "20");
    url.searchParams.set("vote_average.gte", "5");
    url.searchParams.set("page", "1");

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(
        `TMDB request failed: ${response.status} ${response.statusText}`
      );
    }

    const data: { results: TMDBShow[] } =
      await response.json();

    const webSeries = data.results
      .filter(
        (show) =>
          show.poster_path &&
          show.overview?.trim() &&
          !show.genre_ids?.includes(16)
      )
      .slice(0, 10)
      .map((show) => ({
        id: show.id,
        title: show.name,
        poster: `https://image.tmdb.org/t/p/w500${show.poster_path}`,
        year: show.first_air_date
          ? show.first_air_date.slice(0, 4)
          : "N/A",
        rating: show.vote_average,
        overview: show.overview,
      }));

    return NextResponse.json({ webseries: webSeries });
  } catch (error) {
    console.error("TMDB web series error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch web series.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
