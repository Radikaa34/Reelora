
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Clapperboard,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { auth, db, googleProvider } from "../lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

function getSignupError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please log in.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Please choose a stronger password.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Firebase sign-in.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return "We couldn't create your account. Please try again.";
  }
}

const countries = [
  "Australia",
  "Brazil",
  "Canada",
  "China",
  "France",
  "Germany",
  "India",
  "Indonesia",
  "Italy",
  "Japan",
  "Malaysia",
  "Mexico",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Pakistan",
  "Philippines",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Thailand",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Vietnam",
];

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    console.log("GOOGLE SIGNUP CLICKED");
console.log("COUNTRY VALUE:", JSON.stringify(country));

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    if (!agreed) {
      setError("Please agree to the Terms of Use and Privacy Policy.");
      return;
    }

    if (!country.trim()) {
  console.log("BLOCKED: No country selected");

  alert("Please select your country before continuing!");

  setError("Please select your country.");
  return;
}

console.log("COUNTRY VALID:", country);

    console.log("Country validation reached");

    setLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(credential.user, {
        displayName: name.trim(),
      });

      await setDoc(
        doc(db,"users",credential.user.uid),
        {
          name:name.trim(),
          email:email.trim().toLowerCase(),
          country:country,
          createdAt:serverTimestamp(),
        },
        {merge:true}
      )

      router.replace("/dashboard");
    } catch (err: unknown) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String(err.code)
          : "";

      setError(getSignupError(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");

    if (!agreed) {
      setError("Please agree to the Terms of Use and Privacy Policy.");
      return;
    }

    if(!country){
      setError("Please select your Country.");
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      const existingData = userSnap.data();

      await setDoc(
        userRef,
        {
          name: user.displayName ?? "",
          email: user.email ?? "",
          country: existingData?.country || country,
          createdAt: existingData?.createdAt ?? serverTimestamp(),
        },
        { merge: true }
      );

      router.replace("/dashboard");
    } catch (err: unknown) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String(err.code)
          : "";

      setError(getSignupError(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="signup-page">
      <section className="signup-shell">
        <div className="signup-showcase">
          <Link href="/" className="signup-logo">
            REELORA
            <span className="signup-logo-mark" aria-hidden="true" />
          </Link>

          <p className="signup-brand-caption">Stories for every you</p>

          <div className="signup-intro">
            <p className="signup-eyebrow">YOUR STORY UNIVERSE</p>

            <h1>
              Join
              <br />
              <span>REELORA</span>
            </h1>

            <h2>Step into a universe of stories.</h2>

            <p className="signup-description">
              Explore anime, dramas, movies, web series, and comics.
              Save your favorites, discover your next obsession, and
              create a collection of stories that feel like yours.
            </p>

            <div className="signup-benefits">
              <div className="signup-benefit">
                <span className="benefit-icon">
                  <Clapperboard size={22} aria-hidden="true" />
                </span>
                <div>
                  <h3>Save your favorites</h3>
                  <p>Build your personal watchlist.</p>
                </div>
              </div>

              <div className="signup-benefit">
                <span className="benefit-icon">
                  <Sparkles size={22} aria-hidden="true" />
                </span>
                <div>
                  <h3>Discover more stories</h3>
                  <p>Find something for every mood.</p>
                </div>
              </div>

              <div className="signup-benefit">
                <span className="benefit-icon">
                  <UsersRound size={22} aria-hidden="true" />
                </span>
                <div>
                  <h3>Make it personal</h3>
                  <p>Rate, review, and track your journey.</p>
                </div>
              </div>
            </div>
          </div>

          <p className="signup-showcase-footer">
            Find your next favorite story.
          </p>
        </div>

        <div className="signup-form-side">
          <div className="signup-top-link">
            <span>Already have an account?</span>
            <Link href="/login" className="signup-login-button">
              Log In
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="signup-card">
            <div className="signup-card-heading">
              <span className="signup-decoration" aria-hidden="true" />

              <h2>
                Create your <span>account</span>
              </h2>

              <p>Start your journey with REELORA.</p>
            </div>

            <form className="signup-form" onSubmit={handleSubmit}>
              <label className="signup-field">
                <span className="signup-field-icon">
                  <UserRound size={20} aria-hidden="true" />
                </span>
                <span className="signup-field-content">
                  <span>Full Name</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </span>
              </label>

              <label className="signup-field">
                <span className="signup-field-icon">
                  <Mail size={20} aria-hidden="true" />
                </span>
                <span className="signup-field-content">
                  <span>Email Address</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </span>
              </label>

              <div className="signup-field">
              <div className="signup-field-content">
                <label htmlFor="country">Country / Region</label>

                <select
                  id="country"
                  name="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                >
                  <option value="">Select your country</option>

                  {countries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

              <label className="signup-field">
                <span className="signup-field-icon">
                  <LockKeyhole size={20} aria-hidden="true" />
                </span>
                <span className="signup-field-content">
                  <span>Password</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </span>
                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </label>

              <label className="signup-field">
                <span className="signup-field-icon">
                  <LockKeyhole size={20} aria-hidden="true" />
                </span>
                <span className="signup-field-content">
                  <span>Confirm Password</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </span>
                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </label>

              <label className="signup-terms">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  required
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms">Terms of Use</Link> and{" "}
                  <Link href="/privacy">Privacy Policy</Link>.
                </span>
              </label>

              {error && (
                <p className="signup-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="signup-submit"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <ArrowRight size={18} aria-hidden="true" />}
              </button>

              <div className="signup-divider">
                <span />
                <p>or continue with</p>
                <span />
              </div>

              <button
                type="button"
                className="signup-google"
                onClick={handleGoogleSignup}
                disabled={loading}
              >
                <span className="google-g" aria-hidden="true">G</span>
                Continue with Google
              </button>

              <p className="signup-mobile-login">
                Already have an account?{" "}
                <Link href="/login">Log In</Link>
              </p>
            </form>
          </div>

          <p className="signup-privacy-note">
            Your account. Your favorites. Your story.
          </p>
        </div>
      </section>
    </main>
  );
}
