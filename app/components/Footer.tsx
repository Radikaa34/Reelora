
import Link from "next/link";

const exploreLinks = [
  { label: "Anime", href: "/anime" },
  { label: "Dramas", href: "/dramas" },
  { label: "Movies", href: "/movies" },
  { label: "Web Series", href: "/webseries" },
  { label: "Comics", href: "/comics" },
];

const accountLinks = [
  { label: "My Watchlist", href: "/watchlist" },
  { label: "My Reviews", href: "/reviews" },
  { label: "Recommendations", href: "/recommendations" },
];

export default function Footer() {
  return (
    <footer className="reelora-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            REELORA<span>✦</span>
          </Link>

          <p className="footer-tagline">
            Discover stories. Feel everything.
          </p>

          <p className="footer-description">
            Your cozy universe for anime, dramas, movies,
            web series, comics, and unforgettable stories.
          </p>
        </div>

        <div className="footer-column">
          <h3>Explore</h3>
          {exploreLinks.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="footer-column">
          <h3>Your Space</h3>
          {accountLinks.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="footer-column">
          <h3>REELORA</h3>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Use</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2026 REELORA. Made for story lovers.
        </p>

        <p className="footer-heart">
          Made with <span>♥</span> for every mood.
        </p>
      </div>
    </footer>
  );
}
