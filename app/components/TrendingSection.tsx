import { getTrendingAnime, type Anime } from "../lib/anilist";

export default async function TrendingSection() {
    const animeList = await getTrendingAnime();

    return (
        <section className="trending-section">
            <h2>Trending Animes This Week</h2>

            <div className="trending-grid">
                {animeList.map((anime: Anime) => (
                    <div key={anime.id} className="anime-card">
                        <img
                            src={anime.coverImage.large}
                            alt={anime.title.english || anime.title.romaji}
                        />

                        <h3>
                            {anime.title.english || anime.title.romaji}
                        </h3>

                        <p>
                            Score: {anime.averageScore ?? "Not rated"} / 100
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
