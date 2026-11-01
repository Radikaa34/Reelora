"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../lib/firebase";
import styles from "./anime.module.css";

type Anime = {
  id: number;
  title: {
    romaji?: string | null;
    english?: string | null;
    native?: string | null;
  };
  coverImage?: {
    extraLarge?: string | null;
    large?: string | null;
  };
  bannerImage?: string | null;
  description?: string | null;
  genres?: string[];
  averageScore?: number | null;
  episodes?: number | null;
  duration?: number | null;
  format?: string | null;
  status?: string | null;
  season?: string | null;
  seasonYear?: number | null;
  startDate?: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  };
  endDate?: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  };
  studios?: {
    nodes?: { name: string }[];
  };
  siteUrl?: string;
};

type WatchStatus =
  | "Want to Watch"
  | "Currently Watching"
  | "Already Watched";

type SavedAnime = {
  status: WatchStatus;
};

const moods = [
  {
    name: "Comfort",
    emoji: "☁",
    description: "Feel-good anime",
  },
  {
    name: "Hype",
    emoji: "⚡",
    description: "Action and energy",
  },
  {
    name: "Emotional",
    emoji: "♡",
    description: "Heartfelt stories",
  },
  {
    name: "Romance",
    emoji: "♥",
    description: "Love stories",
  },
  {
    name: "Mystery",
    emoji: "◈",
    description: "Thrillers and twists",
  },
  {
    name: "Adventure",
    emoji: "✦",
    description: "Exploration and wonder",
  },
] as const;

const browseTabs = [
  { label: "Popular", sort: "POPULARITY_DESC" },
  { label: "Trending", sort: "TRENDING_DESC" },
  { label: "Top Rated", sort: "SCORE_DESC" },
  { label: "New Releases", sort: "START_DATE_DESC" },
  { label: "Upcoming", sort: "START_DATE" },
] as const;

function titleOf(anime: Anime) {
  return (
    anime.title.english ||
    anime.title.romaji ||
    anime.title.native ||
    "Untitled anime"
  );
}

function plainText(description?: string | null) {
  if (!description) {
    return "No synopsis is available for this title yet.";
  }

  return description
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(
  date?: Anime["startDate"],
) {
  if (!date?.year) return "Not announced";

  const month = date.month
    ? new Date(2000, date.month - 1).toLocaleString(
        "en",
        { month: "short" },
      )
    : "";

  return [
    month,
    date.day,
    date.year,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function AnimePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [anime, setAnime] = useState<Anime[]>([]);
  const [featured, setFeatured] = useState<Anime | null>(null);
  const [selected, setSelected] = useState<Anime | null>(null);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] =
    useState<(typeof browseTabs)[number]["label"]>(
      "Popular",
    );

  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [mood, setMood] =
    useState<(typeof moods)[number]["name"] | "">("");

  const [saved, setSaved] =
    useState<Record<string, SavedAnime>>({});

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Firebase authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthReady(true);
      },
    );

    return unsubscribe;
  }, []);

  // Keep the anime collection synced with Firestore
  useEffect(() => {
    if (!user) {
      setSaved({});
      return;
    }

    const titlesRef = collection(
      db,
      "users",
      user.uid,
      "titles",
    );

    const unsubscribe = onSnapshot(
      titlesRef,
      (snapshot) => {
        const next: Record<string, SavedAnime> = {};

        snapshot.docs.forEach((item) => {
          const data = item.data();

          if (data.category !== "Anime") return;

          const externalId = String(
            data.externalId ??
              item.id.replace(/^anime-/, ""),
          );

          next[externalId] = {
            status: data.status as WatchStatus,
          };
        });

        setSaved(next);
      },
      (snapshotError) => {
        console.error(
          "Could not sync saved anime:",
          snapshotError,
        );
      },
    );

    return unsubscribe;
  }, [user]);

  // Fetch anime from our own Next.js API route
  const loadAnime = useCallback(
    async (reset = true) => {
      setLoading(true);
      setError("");

      const targetPage = reset ? 1 : page + 1;

      const selectedTab =
        browseTabs.find(
          (item) => item.label === activeTab,
        ) ?? browseTabs[0];

      const params = new URLSearchParams({
        page: String(targetPage),
        sort: selectedTab.sort,
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (genre) {
        params.set("genre", genre);
      }

      if (year) {
        params.set("year", year);
      }

      if (mood) {
        params.set("mood", mood);
      }

      try {
        const response = await fetch(
          `/api/anime?${params.toString()}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load anime.",
          );
        }

        const results: Anime[] = data.results ?? [];

        setAnime((current) =>
          reset ? results : [...current, ...results],
        );

        if (reset) {
          setFeatured(results[0] ?? null);
        }

        setPage(targetPage);
        setHasNextPage(Boolean(data.hasNextPage));
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Something went wrong while loading anime.",
        );
      } finally {
        setLoading(false);
      }
    },
    [activeTab, genre, year, mood, search, page],
  );

  // Debounce search input to avoid making a request per keystroke
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAnime(true);
    }, search.trim() ? 350 : 0);

    return () => window.clearTimeout(timer);
  }, [
    activeTab,
    genre,
    year,
    mood,
    search,
    loadAnime,
  ]);

  // Save, change status, or remove anime from the collection
  const saveAnime = async (
    item: Anime,
    status: WatchStatus,
  ) => {
    if (!user) {
      router.push("/login");
      return;
    }

    setSavingId(item.id);
    setError("");

    try {
      const titleRef = doc(
        db,
        "users",
        user.uid,
        "titles",
        `anime-${item.id}`,
      );

      const current = saved[String(item.id)];

      if (current?.status === status) {
        await deleteDoc(titleRef);
      } else if (current) {
        await updateDoc(titleRef, {
          status,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(titleRef, {
          externalId: item.id,
          title: titleOf(item),
          category: "Anime",
          status,
          image:
            item.coverImage?.large ??
            item.coverImage?.extraLarge ??
            "",
          score: item.averageScore ?? null,
          genres: item.genres ?? [],
          episodes: item.episodes ?? null,
          source: "AniList",
          sourceUrl: item.siteUrl ?? "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (saveError) {
      console.error("Could not save anime:", saveError);
      setError(
        "Could not update your collection. Check your Firestore rules.",
      );
    } finally {
      setSavingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setGenre("");
    setYear("");
    setMood("");
  };

  if (!authReady) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>
          Preparing your anime universe…
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.ambient} />

      <header className={styles.topbar}>
        <button
          className={styles.brand}
          onClick={() => router.push("/dashboard")}
        >
          REEL<span>O</span>RA
        </button>

        <nav className={styles.nav}>
          <button onClick={() => router.push("/dashboard")}>
            Home
          </button>
          <button className={styles.activeNav}>
            Anime
          </button>
          <button onClick={() => router.push("/movies")}>
            Movies
          </button>
          <button onClick={() => router.push("/dramas")}>
            Dramas
          </button>
          <button onClick={() => router.push("/web-series")}>
            Web Series
          </button>
          <button onClick={() => router.push("/comics")}>
            Comics
          </button>
        </nav>

        <div className={styles.headerSearch}>
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search anime..."
            aria-label="Search anime"
          />
        </div>

        <div className={styles.account}>
          {(
            user?.displayName?.slice(0, 1) ||
            user?.email?.slice(0, 1) ||
            "R"
          ).toUpperCase()}
        </div>
      </header>

      {/* Featured anime */}
      <section
        className={styles.hero}
        style={
          featured?.bannerImage
            ? {
                backgroundImage: `linear-gradient(90deg, rgba(9,7,19,.98) 0%, rgba(9,7,19,.82) 42%, rgba(9,7,19,.12) 100%), url("${featured.bannerImage}")`,
              }
            : undefined
        }
      >
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>
            ✦ YOUR NEXT OBSESSION STARTS HERE
          </span>

          <h1>
            {featured
              ? titleOf(featured)
              : "Where will your story take you?"}
          </h1>

          <div className={styles.heroMeta}>
            {featured?.genres?.slice(0, 3).join(" · ") ||
              "Anime · Fantasy · Adventure"}
            {featured?.seasonYear
              ? ` · ${featured.seasonYear}`
              : ""}
            {featured?.episodes
              ? ` · ${featured.episodes} Episodes`
              : ""}
          </div>

          <p>
            {plainText(featured?.description).slice(0, 240)}
            {(featured?.description?.length ?? 0) > 240
              ? "…"
              : ""}
          </p>

          <div className={styles.heroActions}>
            <button
              className={styles.primaryButton}
              onClick={() =>
                featured && setSelected(featured)
              }
            >
              View Details ↗
            </button>

            {featured?.siteUrl && (
              <a
                className={styles.secondaryButton}
                href={featured.siteUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open AniList ↗
              </a>
            )}
          </div>
        </div>

        <div className={styles.heroFoot}>
          <span>CURATED FOR YOUR NEXT BINGE</span>
          <span className={styles.heroDots}>● ○ ○ ○ ○</span>
        </div>
      </section>

      {/* Mood discovery */}
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.kicker}>
              FOLLOW THE FEELING
            </span>
            <h2>What are you in the mood for?</h2>
          </div>

          {mood && (
            <button
              className={styles.clearButton}
              onClick={() => setMood("")}
            >
              Clear mood ×
            </button>
          )}
        </div>

        <div className={styles.moodGrid}>
          {moods.map((item) => (
            <button
              key={item.name}
              onClick={() => setMood(
                mood === item.name ? "" : item.name,
              )}
              className={`${styles.moodCard} ${
                mood === item.name
                  ? styles.moodSelected
                  : ""
              }`}
            >
              <span className={styles.moodIcon}>
                {item.emoji}
              </span>
              <span className={styles.moodName}>
                {item.name}
              </span>
              <span className={styles.moodDescription}>
                {item.description}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Catalogue */}
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.kicker}>
              FIND YOUR NEXT FAVOURITE
            </span>
            <h2>
              {search
                ? `Results for “${search}”`
                : mood
                  ? `${mood} anime`
                  : "Explore Anime"}
            </h2>
          </div>

          <button
            className={styles.filterButton}
            onClick={() => setShowFilters((value) => !value)}
          >
            ☷ Filters
          </button>
        </div>

        {showFilters && (
          <div className={styles.filters}>
            <label>
              Genre
              <select
                value={genre}
                onChange={(event) =>
                  setGenre(event.target.value)
                }
              >
                <option value="">All genres</option>
                {[
                  "Action",
                  "Adventure",
                  "Comedy",
                  "Drama",
                  "Fantasy",
                  "Horror",
                  "Mystery",
                  "Romance",
                  "Sci-Fi",
                  "Slice of Life",
                  "Sports",
                  "Supernatural",
                  "Thriller",
                ].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Year
              <input
                type="number"
                min="1940"
                max="2035"
                placeholder="e.g. 2024"
                value={year}
                onChange={(event) =>
                  setYear(event.target.value)
                }
              />
            </label>

            <button
              className={styles.clearButton}
              onClick={clearFilters}
            >
              Clear all
            </button>
          </div>
        )}

        <div className={styles.tabs}>
          {browseTabs.map((tab) => (
            <button
              key={tab.label}
              className={
                activeTab === tab.label
                  ? styles.activeTab
                  : ""
              }
              onClick={() => setActiveTab(tab.label)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        {loading && anime.length === 0 && (
          <div className={styles.loading}>
            Finding your next favourite…
          </div>
        )}

        {!loading && anime.length === 0 && !error && (
          <div className={styles.empty}>
            No titles found. Try another search or clear a
            filter.
          </div>
        )}

        <div className={styles.animeGrid}>
          {anime.map((item) => {
            const current = saved[String(item.id)];

            return (
              <article
                className={styles.animeCard}
                key={item.id}
              >
                <button
                  className={styles.posterButton}
                  onClick={() => setSelected(item)}
                  aria-label={`View ${titleOf(item)}`}
                >
                  <img
                    src={
                      item.coverImage?.extraLarge ||
                      item.coverImage?.large ||
                      "/placeholder-anime.png"
                    }
                    alt={`${titleOf(item)} poster`}
                    loading="lazy"
                  />
                  <span className={styles.posterScore}>
                    ★{" "}
                    {item.averageScore
                      ? (item.averageScore / 10).toFixed(1)
                      : "—"}
                  </span>
                  <span className={styles.posterPlus}>↗</span>
                </button>

                <div className={styles.cardBody}>
                  <button
                    className={styles.titleButton}
                    onClick={() => setSelected(item)}
                  >
                    {titleOf(item)}
                  </button>

                  <p>
                    {item.genres?.slice(0, 2).join(" · ") ||
                      item.format ||
                      "Anime"}
                    {item.seasonYear
                      ? ` · ${item.seasonYear}`
                      : ""}
                  </p>

                  <div className={styles.cardFooter}>
                    <span>
                      {item.episodes
                        ? `${item.episodes} eps`
                        : item.status === "NOT_YET_RELEASED"
                          ? "Upcoming"
                          : "Episodes TBA"}
                    </span>

                    <button
                      disabled={savingId === item.id}
                      onClick={() =>
                        void saveAnime(item, "Want to Watch")
                      }
                    >
                      {savingId === item.id
                        ? "Saving…"
                        : current?.status === "Want to Watch"
                          ? "✓ Saved"
                          : "+ Add"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {loading && anime.length > 0 && (
          <p className={styles.loadingMore}>
            Loading more titles…
          </p>
        )}

        {hasNextPage && anime.length > 0 && (
          <div className={styles.loadMore}>
            <button
              className={styles.secondaryButton}
              disabled={loading}
              onClick={() => void loadAnime(false)}
            >
              {loading
                ? "Loading…"
                : "Load more anime ↓"}
            </button>
          </div>
        )}
      </section>

      <section className={styles.streamingNote}>
        <span>◎</span>
        <div>
          <strong>Where to watch</strong>
          <p>
            Streaming availability changes by country and
            over time. Check the official listing for current
            viewing information. Provider cards can be added
            once a reliable regional source is configured.
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        <strong>REELORA</strong>
        <span>Discover. Track. Feel. Relive.</span>
        <span>Anime metadata powered by AniList.</span>
      </footer>

      {/* Anime details modal */}
      {selected && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <section
            className={styles.detailModal}
            role="dialog"
            aria-modal="true"
            aria-label={`${titleOf(selected)} details`}
          >
            <button
              className={styles.modalClose}
              onClick={() => setSelected(null)}
              aria-label="Close details"
            >
              ×
            </button>

            <div
              className={styles.detailHero}
              style={
                selected.bannerImage
                  ? {
                      backgroundImage: `linear-gradient(90deg, #100c1b 5%, rgba(16,12,27,.65)), url("${selected.bannerImage}")`,
                    }
                  : undefined
              }
            >
              <img
                src={
                  selected.coverImage?.large ||
                  selected.coverImage?.extraLarge ||
                  ""
                }
                alt={`${titleOf(selected)} poster`}
              />

              <div>
                <span className={styles.kicker}>
                  ANIME DETAILS
                </span>
                <h2>{titleOf(selected)}</h2>
                <p>
                  {selected.title.native ||
                    selected.title.romaji ||
                    ""}
                </p>

                <div className={styles.detailPills}>
                  {selected.genres?.slice(0, 5).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.detailColumns}>
              <div>
                <h3>Synopsis</h3>
                <p className={styles.synopsis}>
                  {plainText(selected.description)}
                </p>

                <h3>Where to watch</h3>
                <p className={styles.muted}>
                  AniList does not provide verified streaming
                  provider availability. Use the official
                  listing to check current information.
                </p>

                {selected.siteUrl && (
                  <a
                    className={styles.primaryButton}
                    href={selected.siteUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View official listing ↗
                  </a>
                )}
              </div>

              <aside className={styles.detailAside}>
                <h3>Your collection</h3>

                {(
                  [
                    "Want to Watch",
                    "Currently Watching",
                    "Already Watched",
                  ] as const
                ).map((status) => (
                  <button
                    key={status}
                    className={`${styles.statusButton} ${
                      saved[String(selected.id)]?.status ===
                      status
                        ? styles.statusActive
                        : ""
                    }`}
                    disabled={savingId === selected.id}
                    onClick={() =>
                      void saveAnime(selected, status)
                    }
                  >
                    {saved[String(selected.id)]?.status ===
                    status
                      ? "✓ "
                      : "+ "}
                    {status}
                  </button>
                ))}

                <dl className={styles.facts}>
                  <div>
                    <dt>Score</dt>
                    <dd>
                      {selected.averageScore
                        ? `${(selected.averageScore / 10).toFixed(1)} / 10`
                        : "Not rated"}
                    </dd>
                  </div>
                  <div>
                    <dt>Format</dt>
                    <dd>{selected.format || "Unknown"}</dd>
                  </div>
                  <div>
                    <dt>Episodes</dt>
                    <dd>{selected.episodes ?? "TBA"}</dd>
                  </div>
                  <div>
                    <dt>Episode duration</dt>
                    <dd>
                      {selected.duration
                        ? `${selected.duration} min`
                        : "Unknown"}
                    </dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>
                      {(selected.status || "Unknown").replaceAll(
                        "_",
                        " ",
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>First aired</dt>
                    <dd>{formatDate(selected.startDate)}</dd>
                  </div>
                  <div>
                    <dt>Last aired</dt>
                    <dd>{formatDate(selected.endDate)}</dd>
                  </div>
                  <div>
                    <dt>Season</dt>
                    <dd>
                      {selected.season
                        ? `${selected.season} ${selected.seasonYear ?? ""}`
                        : selected.seasonYear ?? "Unknown"}
                    </dd>
                  </div>
                  <div>
                    <dt>Studios</dt>
                    <dd>
                      {selected.studios?.nodes
                        ?.map((studio) => studio.name)
                        .join(", ") || "Not listed"}
                    </dd>
                  </div>
                </dl>
              </aside>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}