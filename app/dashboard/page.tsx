
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import UniverseScene from "../components/UniverseScene";
import {
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  BookOpen,
  Check,
  Clock3,
  Film,
  LibraryBig,
  LogOut,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Tv,
} from "lucide-react";

import { auth, db } from "../lib/firebase";
import styles from "./dashboard.module.css";

type Category = "Anime" | "Movies" | "Dramas" | "Web Series" | "Comics";
type TitleStatus = "Want to Watch" | "Already Watched";

type SavedTitle = {
  id: string;
  title: string;
  category: Category;
  status: TitleStatus;
};

const categories: Category[] = [
  "Anime",
  "Movies",
  "Dramas",
  "Web Series",
  "Comics",
];

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [titles, setTitles] = useState<SavedTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [category, setCategory] = useState<Category>("Anime");
  const [status, setStatus] = useState<TitleStatus>("Want to Watch");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");

  
const categoryWorlds = [
  {
    name: "Anime",
    route: "/anime",
    icon: Sparkles,
    color: "#c084fc",
    description: "Enter animated worlds",
    image: "/globes/anime.jpeg",
  },
  {
    name: "Movies",
    route: "/movies",
    icon: Film,
    color: "#fb7185",
    description: "Find your next film",
    image: "/globes/movie.jpeg",
  },
  {
    name: "Dramas",
    route: "/dramas",
    icon: Sparkles,
    color: "#f9a8d4",
    description: "Feel every story",
    image: "/globes/drama.jpeg",
  },
  {
    name: "Web Series",
    route: "/webseries",
    icon: Tv,
    color: "#7dd3fc",
    description: "One more episode",
    image: "/globes/webseries.jpeg",
  },
  {
    name: "Comics",
    route: "/comics",
    icon: BookOpen,
    color: "#86efac",
    description: "Explore illustrated worlds",
    image: "/globes/comics.jpeg",
  },
  {
    name: "Marvel",
    route: "/marvel",
    icon: Sparkles,
    color: "#ef4444",
    description: "Enter the Marvel universe",
    image: "/globes/marvel.jpeg",
  },
];


  useEffect(() => {
    let unsubscribeTitles: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      unsubscribeTitles?.();
      unsubscribeTitles = undefined;

      setUser(currentUser);
      setTitles([]);

      if (!currentUser) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      setLoading(true);
      setError("");

      const titlesRef = collection(
        db,
        "users",
        currentUser.uid,
        "titles"
      );

      const titlesQuery = query(
        titlesRef,
        orderBy("createdAt", "desc")
      );

      unsubscribeTitles = onSnapshot(
        titlesQuery,
        (snapshot) => {
          const savedTitles = snapshot.docs.map((item) => {
            const data = item.data();

            return {
              id: item.id,
              title: data.title as string,
              category: data.category as Category,
              status: data.status as TitleStatus,
            };
          });

          setTitles(savedTitles);
          setLoading(false);
        },
        (snapshotError) => {
          console.error("Could not load saved titles:", snapshotError);
          setError("Could not load your library. Check your Firestore setup and rules.");
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeTitles?.();
    };
  }, [router]);

  async function handleAddTitle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !titleInput.trim()) return;

    setSaving(true);
    setError("");

    try {
      await addDoc(
        collection(db, "users", user.uid, "titles"),
        {
          title: titleInput.trim(),
          category,
          status,
          createdAt: serverTimestamp(),
        }
      );

      setTitleInput("");
    } catch (addError) {
      console.error("Could not add title:", addError);
      setError("Couldn't save this title. Please check your Firestore rules.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(item: SavedTitle) {
    if (!user) return;

    const nextStatus: TitleStatus =
      item.status === "Want to Watch"
        ? "Already Watched"
        : "Want to Watch";

    setError("");

    try {
      await updateDoc(
        doc(db, "users", user.uid, "titles", item.id),
        { status: nextStatus }
      );
    } catch (updateError) {
      console.error("Could not update title:", updateError);
      setError("Couldn't update the title status.");
    }
  }

  async function handleDelete(id: string) {
    if (!user) return;

    setError("");

    try {
      await deleteDoc(doc(db, "users", user.uid, "titles", id));
    } catch (deleteError) {
      console.error("Could not delete title:", deleteError);
      setError("Couldn't delete this title.");
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  const filteredTitles = titles.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const wantCount = titles.filter(
    (item) => item.status === "Want to Watch"
  ).length;

  const watchedCount = titles.filter(
    (item) => item.status === "Already Watched"
  ).length;

  if (loading) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.loader} />
        <p>Loading your REELORA library...</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <UniverseScene/>
      <header className={styles.header}>
        <button
          className={styles.brand}
          onClick={() => router.push("/")}
          aria-label="Go to homepage"
        >
          <span className={styles.brandIcon}>
            <Sparkles size={21} />
          </span>
          <span>REELORA</span>
        </button>

        <div className={styles.headerRight}>
          <span className={styles.userLabel}>
            {user?.displayName || user?.email || "Your account"}
          </span>
          <button
            className={styles.logoutButton}
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut size={17} />
            <span>Log out</span>
          </button>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.welcome}>
          <div>
            <p className={styles.eyebrow}>YOUR PERSONAL COLLECTION</p>
            <h1>My Library<span>.</span></h1>
            <p className={styles.subtitle}>
              Every story you love, all in one place.
            </p>
          </div>

          <div className={styles.libraryBadge}>
            <LibraryBig size={22} />
            <span>{titles.length} saved {titles.length === 1 ? "title" : "titles"}</span>
          </div>
        </div>

        <section className={styles.stats}>
          <article className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.purpleIcon}`}>
              <Clock3 size={21} />
            </div>
            <div>
              <p>Want to Watch</p>
              <strong>{wantCount}</strong>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.greenIcon}`}>
              <Check size={21} />
            </div>
            <div>
              <p>Already Watched</p>
              <strong>{watchedCount}</strong>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.orangeIcon}`}>
              <Film size={21} />
            </div>
            <div>
              <p>Total Collection</p>
              <strong>{titles.length}</strong>
            </div>
          </article>
        </section>

        

<section className={styles.worldsSection}>
  <div className={styles.worldsHeading}>
    <div>
      <p className={styles.eyebrow}>CHOOSE YOUR NEXT ADVENTURE</p>
      <h2>Where will your story take you?</h2>
      <p>Choose a universe. Discover something unforgettable.</p>
    </div>
  </div>

  <div className={styles.worldsGrid}>
    {categoryWorlds.map((world, index) => {
      const Icon = world.icon;

      return (
        <button
          key={world.name}
          type="button"
          className={styles.worldCard}
          style={{
            "--world-color": world.color,
            "--world-delay": `${index * 120}ms`,
          } as React.CSSProperties}
          onClick={() => router.push(world.route)}
        >
          <span className={styles.worldOrb}>
            <span className={styles.worldOrbCore}>
              <Icon size={31} strokeWidth={1.6} />
            </span>
            <span className={styles.worldOrbit} />
            <span className={styles.worldSparkle}>✦</span>
          </span>

          <span className={styles.worldName}>{world.name}</span>
          <span className={styles.worldDescription}>
            {world.description}
          </span>
          <span className={styles.worldExplore}>
            Explore universe <span aria-hidden="true">↗</span>
          </span>
        </button>
      );
    })}
  </div>
</section>



        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        <section className={styles.collection}>
          <div className={styles.collectionHeading}>
            <div>
              <h2>Your collection</h2>
              <p>Manage your saved titles whenever you like.</p>
            </div>
            <span className={styles.resultCount}>
              {filteredTitles.length} {filteredTitles.length === 1 ? "title" : "titles"}
            </span>
          </div>

          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <Search size={18} />
              <input
                type="search"
                placeholder="Search your library..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search titles"
              />
            </div>

            <select
              className={styles.filterSelect}
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by category"
            >
              <option value="All">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All statuses</option>
              <option value="Want to Watch">Want to Watch</option>
              <option value="Already Watched">Already Watched</option>
            </select>
          </div>

          {titles.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <BookOpen size={30} />
              </div>
              <h3>Your story starts here</h3>
              <p>
                Your library is empty for now. Add your first title above
                and it will appear here.
              </p>
            </div>
          ) : filteredTitles.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Search size={28} />
              </div>
              <h3>No matching titles</h3>
              <p>Try another search or change your filters.</p>
              <button
                className={styles.resetButton}
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("All");
                  setStatusFilter("All");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className={styles.titleGrid}>
              {filteredTitles.map((item) => (
                <article className={styles.titleCard} key={item.id}>
                  <div className={styles.posterPlaceholder}>
                    {item.category === "Anime" || item.category === "Comics" ? (
                      <BookOpen size={28} />
                    ) : item.category === "Web Series" || item.category === "Dramas" ? (
                      <Tv size={28} />
                    ) : (
                      <Film size={28} />
                    )}
                    <span>{item.category}</span>
                  </div>

                  <div className={styles.titleInfo}>
                    <span className={styles.categoryLabel}>{item.category}</span>
                    <h3>{item.title}</h3>

                    <span
                      className={`${styles.statusBadge} ${
                        item.status === "Already Watched"
                          ? styles.watchedBadge
                          : styles.wantBadge
                      }`}
                    >
                      {item.status}
                    </span>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.statusButton}
                        onClick={() => handleStatusChange(item)}
                      >
                        <Check size={15} />
                        {item.status === "Want to Watch" ? "Mark watched" : "Watch again"}
                      </button>

                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Delete ${item.title}`}
                        title="Remove from library"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className={styles.footer}>
          Made for your next favourite story <span>♥</span>
        </footer>
      </section>
    </main>
  );
}
