
import { NextResponse } from "next/server";

const LANGUAGES = [
  "ko", // Korean
  "zh", // Chinese
  "ja", // Japanese
  "th", // Thai
  "hi", // Hindi
  "ta", // Tamil
  "te", // Telugu
  "tl", // Filipino
  "id", // Indonesian
  "ms", // Malay
  "vi", // Vietnamese
  "es", // Spanish
  "fr", // French
  "de", // German
  "it", // Italian
  "tr", // Turkish
  "ar", // Arabic
];

type TMDBShow = {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  original_language: string;
  origin_country?: string[];
  genre_ids?: number[];
  vote_count: number;
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
    const results = await Promise.all(
      LANGUAGES.map(async (language) => {
        const url = new URL(
          "https://api.themoviedb.org/3/discover/tv"
        );

        url.searchParams.set("api_key", apiKey);
        url.searchParams.set("with_original_language", language);
        url.searchParams.set("with_genres", "18");
        url.searchParams.set("without_genres", "16");
        url.searchParams.set("sort_by", "popularity.desc");
        url.searchParams.set("include_adult", "false");
        url.searchParams.set("page", "1");

        const response = await fetch(url.toString(), {
          next: { revalidate: 3600 },
        });

        if (!response.ok) {
          throw new Error(
            `TMDB request failed for language: ${language}`
          );
        }

        const data: { results: TMDBShow[] } =
          await response.json();

        return data.results;
      })
    );

    const uniqueDramas = Array.from(
      new Map(
        results
          .flat()
          .filter((show) => show.poster_path && show.overview?.trim())
          .filter((show) => show.genre_ids?.includes(18))
          .filter((show) => !show.genre_ids?.includes(16))
          .filter((show) => show.vote_count >= 20)
          .filter((show) => show.vote_average >= 5)
          .map((show) => [
            show.id,
            {
              id: show.id,
              title: show.name,
              poster: `https://image.tmdb.org/t/p/w500${show.poster_path}`,
              year: show.first_air_date
                ? show.first_air_date.slice(0, 4)
                : "N/A",
              rating: show.vote_average,
              overview: show.overview,
              language: show.original_language,
              countries: show.origin_country ?? [],
            },
          ])
      ).values()
    );

    uniqueDramas.sort((a, b) => b.rating - a.rating);

    return NextResponse.json({
      dramas: uniqueDramas.slice(0, 10),
    });
  } catch (error) {
    console.error("TMDB dramas error:", error);

    return NextResponse.json(
      { error: "Failed to fetch international dramas." },
      { status: 500 }
    );
  }
}
