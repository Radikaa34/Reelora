
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key is missing." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch movies from TMDB." },
        { status: response.status }
      );
    }

    const data = await response.json();

    const movies = data.results.slice(0,10).map((movie: {
      id: number;
      title: string;
      poster_path: string | null;
      release_date: string;
      vote_average: number;
      overview: string;
    }) => ({
      id: movie.id,
      title: movie.title,
      poster: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      year: movie.release_date
        ? movie.release_date.slice(0, 4)
        : "N/A",
      rating: movie.vote_average,
      overview: movie.overview,
    }));

    return NextResponse.json({ movies });
  
  } catch (error) {
    console.error("TMDB fetch error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while fetching movies.",
        details:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

