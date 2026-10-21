export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF6FC] px-4 sm:px-6 md:px-10">
      <nav className="flex items-center justify-between py-5">
        <p className="text-2xl font-bold tracking-wide text-purple-900">
          REELORA
        </p>

        <div className="flex items-center gap-3 sm:gap-5">
          <button className="font-semibold text-purple-500 transition hover:text-purple-700">
            Log In
          </button>

          <button className="rounded-full bg-purple-500 px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-purple-600">
            Sign Up
          </button>
        </div>
      </nav>
      <section className="hero-bg flex items-center px-4 py-10 sm:px-8 md:px-10">
        <div className="hero-card">
          <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-white">
            YOUR STORY UNIVERSE
          </p>

          <h1 className="hero-title my-4">
            Discover. Track. Feel. Relive.
          </h1>

          <p className="hero-description my-5 font-semibold">
            Anime, dramas, movies, comics and stories — all in one cozy place.
          </p>

          <button className="hero-button mt-6">
            Get Started Free
          </button>

          <p className="mt-4 text-center text-sm text-purple-100/80">
            Your next favorite story is waiting.
          </p>
        </div>
      </section>
      <section className="home-box">
        <div className="content">
          <div className="content-text">
          <img src="/sparkles.png"/>
          <p className="font-bold">Curated picks for every mood</p>
          </div>
          <div className="content-text">
          <img src="/heart.png"/>
          <p className="font-bold">Your watchlist and progress</p>
          </div>
          <div className="content-text">
          <img src="/link.png"/>
          <p className="font-bold">Anime, Drama, Movies and comics</p>
          </div>
          <div className="content-text">
          <img src="/clapperboard.png"/>
          <p className="font-bold">Streaming platforms, free or paid</p>
          </div>
          <div className="content-text">
          <img src="/people.png"/>
          <p className="font-bold">Recommendations based on you taste</p>
          </div>
          <div className="content-text">
          <img src="/book.png"/>
          <p className="font-bold">Rate and review your favorite titles</p>
          </div>
        </div>
      </section>
      <section>
        <div className="explore">
          <h1>Explore a Universe of stories</h1>
          <p>Something for every mood, every moment.</p>
          <br></br>
          <div className="explore-content">
            <div className="explore-content-con">
            <img src="/anime.jpg"/>
            <h1>Anime</h1>
            <p>Dive into new worlds</p>
            </div>
            <div className="explore-content-con">
            <img src="/drama.jpg"/>
            <h1>Dramas</h1>
            <p>Feel every emotion</p>
            </div>
            <div className="explore-content-con">
            <img src="/movie.jpg"/>
            <h1>Movies</h1>
            <p>Big stories, Big adventures</p>
            </div>
            <div className="explore-content-con">
            <img src="/comic.jpg"/>
            <h1>Comics</h1>
            <p>Read Amazing worlds</p>
            </div>
            <div className="explore-content-con">
            <img src="/web series.jpg"/>
            <h1>Web Series</h1>
            <p>Short stories, big feelings</p>
            </div>
            <div className="explore-content-con">
            <img src="/marvel.jpg"/>
            <h1>Marvel</h1>
            <p>Feel the marvel universe</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mood">
        <div className="mood-left">
        <h1>Find by Mood</h1>
        <p>Not sure what to watch or read? Start with a mood!</p>
        <div className="mood-content">
          <p>Comfort</p>
          <p>Romance</p>
          <p>Thriller</p>
          <p>Adventure</p>
          <p>Comedy</p>
          <p>Heartbreak</p>
          <p>Motivation</p>
          <p>Fantasy</p>
        </div>
        </div>
        <div className="mood-image">
          <img src="/mood.png" alt="A cozy world of stories" />
        </div>
        
      </section>
    </main>
  );
}
