
"use client";

import { useEffect, useState } from "react";

type Movie = {
  id: number;
  title: string;
  poster: string | null;
  year: string;
  rating: number;
  overview: string;
};

export default function TrendingMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch("/api/movies");

        if (!response.ok) {
          throw new Error("Could not load trending movies.");
        }

        const data = await response.json();
        setMovies(data.movies);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  return (
    <section className="trending-section">
      <h2>Trending Movies</h2>

      {loading && <p>Loading trending movies...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <div className="movies-carousel">
          {movies.map((movie) => (
            <article className="anime-card" key={movie.id}>
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={`${movie.title} poster`}
                  loading="lazy"
                />
              ) : (
                <div className="movie-no-poster">
                  Poster unavailable
                </div>
              )}

              <h3>{movie.title}</h3>

              <p>
                {movie.year} · ★{" "}
                {movie.rating > 0 ? movie.rating.toFixed(1) : "N/A"}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
