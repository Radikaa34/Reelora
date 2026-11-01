
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Clapperboard,
} from "lucide-react";
import { auth, googleProvider } from "../lib/firebase";

function getLoginError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Incorrect email or password. Please try again.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Firebase sign-in.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String(err.code)
          : "";

      setError(getLoginError(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      await signInWithPopup(auth, googleProvider);
      router.replace("/");
    } catch (err: unknown) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String(err.code)
          : "";

      setError(getLoginError(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-showcase">
          <Link href="/" className="login-logo">
            REELORA
            <span className="login-logo-mark" aria-hidden="true" />
          </Link>

          <p className="login-brand-caption">Stories for every you</p>

          <div className="login-intro">
            <p className="login-eyebrow">WELCOME BACK</p>

            <h1>
              Your next
              <br />
              <span>story awaits.</span>
            </h1>

            <p className="login-description">
              Return to your universe of anime, dramas, movies,
              web series, and comics. Your favorites are waiting
              right where you left them.
            </p>

            <div className="login-highlight">
              <span className="login-highlight-icon">
                <Clapperboard size={24} aria-hidden="true" />
              </span>

              <div>
                <h2>Your world of stories</h2>
                <p>
                  Pick up where you left off and discover
                  something new.
                </p>
              </div>
            </div>
          </div>

          <p className="login-showcase-footer">
            Every story deserves another visit.
          </p>
        </div>

        <div className="login-form-side">
          <div className="login-top-link">
            <span>New to REELORA?</span>

            <Link href="/signup" className="login-signup-button">
              Create Account
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="login-card">
            <div className="login-card-heading">
              <span className="login-decoration" aria-hidden="true" />

              <h2>
                Welcome <span>back</span>
              </h2>

              <p>Log in to continue your story.</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <label className="login-field">
                <span className="login-field-icon">
                  <Mail size={20} aria-hidden="true" />
                </span>

                <span className="login-field-content">
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

              <label className="login-field">
                <span className="login-field-icon">
                  <LockKeyhole size={20} aria-hidden="true" />
                </span>

                <span className="login-field-content">
                  <span>Password</span>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </span>

                <button
                  type="button"
                  className="login-password-toggle"
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

              <div className="login-options">
                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <Link href="/forgot-password" className="login-forgot">
                  Forgot password?
                </Link>
              </div>

              {error && (
                <p className="login-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
                {!loading && <ArrowRight size={18} aria-hidden="true" />}
              </button>

              <div className="login-divider">
                <span />
                <p>or continue with</p>
                <span />
              </div>

              <button
                type="button"
                className="login-google"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <span className="login-google-g" aria-hidden="true">
                  G
                </span>
                Continue with Google
              </button>

              <p className="login-mobile-signup">
                New to REELORA?{" "}
                <Link href="/signup">Create an account</Link>
              </p>
            </form>
          </div>

          <p className="login-privacy-note">
            Your account. Your favorites. Your story.
          </p>
        </div>
      </section>
    </main>
  );
}
