
"use client";

import { useEffect, useState } from "react";

type Drama = {
  id: number;
  title: string;
  poster: string | null;
  year: string;
  rating: number;
  overview: string;
};

export default function TrendingDramas() {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDramas() {
      try {
        const response = await fetch("/api/dramas");

        if (!response.ok) {
          throw new Error("Failed to load trending dramas.");
        }

        const data = await response.json();
        setDramas(data.dramas);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDramas();
  }, []);

  return (
    <section className="trending-section">
      <h2>Trending Dramas</h2>

      {loading && <p>Loading trending dramas...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <div className="movies-carousel">
          {dramas.map((drama) => (
            <article className="anime-card" key={drama.id}>
              {drama.poster ? (
                <img
                  src={drama.poster}
                  alt={`${drama.title} poster`}
                  loading="lazy"
                />
              ) : (
                <div className="movie-no-poster">
                  Poster unavailable
                </div>
              )}

              <h3>{drama.title}</h3>

              <p>
                {drama.year} · ★{" "}
                {drama.rating > 0
                  ? drama.rating.toFixed(1)
                  : "N/A"}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
