// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Syne:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          min-height: 100vh;
          min-height: 100dvh;
          background: #07080c;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
          color: #f0f0f0;
        }

        /* Background */
        .lp-bg-glow1 {
          position: fixed; pointer-events: none; z-index: 0;
          top: -15%; left: 50%; transform: translateX(-50%);
          width: min(700px, 120vw); height: 500px;
          background: radial-gradient(ellipse, rgba(52,211,153,0.07) 0%, transparent 65%);
        }
        .lp-bg-glow2 {
          position: fixed; pointer-events: none; z-index: 0;
          bottom: -15%; right: -15%;
          width: 500px; height: 400px;
          background: radial-gradient(ellipse, rgba(129,140,248,0.05) 0%, transparent 65%);
        }
        .lp-grid-v {
          position: fixed; pointer-events: none; z-index: 0;
          top: 0; bottom: 0; width: 1px;
          background: rgba(255,255,255,0.022);
        }
        .lp-grid-h {
          position: fixed; pointer-events: none; z-index: 0;
          left: 0; right: 0; height: 1px;
          background: rgba(255,255,255,0.022);
        }

        /* Nav */
        .lp-nav {
          position: relative; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .lp-logo {
          display: flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .lp-logo-icon {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: linear-gradient(135deg, #6ee7b7, #818cf8);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; color: #042c1e; font-weight: 800;
          box-shadow: 0 0 16px rgba(110,231,183,0.2);
        }
        .lp-logo-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 16px; color: #f0f0f0; letter-spacing: -0.3px;
        }
        .lp-nav-link {
          font-size: 13px; color: rgba(255,255,255,0.4);
          text-decoration: none; font-weight: 500; transition: color 0.2s;
        }
        .lp-nav-link:hover { color: #6ee7b7; }

        /* Body layout — mobile: single column */
        .lp-body {
          flex: 1; position: relative; z-index: 1;
          display: flex; flex-direction: column;
        }

        /* Form section */
        .lp-form-section {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 36px 20px 56px;
        }
        .lp-form-wrap { width: 100%; max-width: 400px; }

        /* Mobile heading */
        .lp-mob-head {
          text-align: center; margin-bottom: 28px;
        }
        .lp-mob-head h1 {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 26px;
          color: #f0f0f0; letter-spacing: -0.7px; margin-bottom: 6px;
        }
        .lp-mob-head p { font-size: 14px; color: rgba(255,255,255,0.38); }

        /* Card */
        .lp-card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px; padding: 28px 24px;
          position: relative; overflow: hidden;
        }
        .lp-card::before {
          content: '';
          position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.11), transparent);
        }

        /* Fields */
        .lp-field { margin-bottom: 16px; }
        .lp-field-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 8px;
        }
        .lp-label {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.9px; text-transform: uppercase;
          color: rgba(255,255,255,0.32);
        }
        .lp-forgot {
          font-size: 12px; color: rgba(110,231,183,0.7);
          text-decoration: none; transition: color 0.2s;
        }
        .lp-forgot:hover { color: #6ee7b7; }

        /* font-size 16px prevents iOS zoom on focus */
        .lp-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #f0f0f0;
          font-size: 16px;
          padding: 13px 16px;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          -webkit-appearance: none; appearance: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .lp-input::placeholder { color: rgba(255,255,255,0.22); }
        .lp-input:focus {
          border-color: rgba(110,231,183,0.45);
          background: rgba(110,231,183,0.04);
          box-shadow: 0 0 0 3px rgba(110,231,183,0.08);
        }

        /* Error */
        .lp-err {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.22);
          color: #fca5a5; font-size: 13px;
          padding: 11px 14px; border-radius: 10px;
          margin-bottom: 18px;
          display: flex; align-items: flex-start; gap: 8px;
        }

        /* Button */
        .lp-btn {
          display: block; width: 100%;
          background: linear-gradient(135deg, #6ee7b7, #34d399);
          color: #042c1e; border: none;
          padding: 15px; border-radius: 12px;
          font-size: 15px; font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; margin-top: 22px;
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .lp-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(52,211,153,0.22); }
        .lp-btn:active { transform: scale(0.99); }
        .lp-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
        .lp-btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }

        @keyframes lp-spin { to { transform: rotate(360deg); } }
        .lp-spin { width: 16px; height: 16px; animation: lp-spin 0.8s linear infinite; flex-shrink: 0; }

        /* Divider */
        .lp-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 20px 0;
        }
        .lp-div-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .lp-div-txt { font-size: 11px; color: rgba(255,255,255,0.22); text-transform: uppercase; letter-spacing: 0.8px; }

        /* Bottom link */
        .lp-bottom { text-align: center; font-size: 13px; color: rgba(255,255,255,0.32); }
        .lp-bottom a { color: #6ee7b7; text-decoration: none; font-weight: 500; }

        /* Animations */
        @keyframes lp-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .a0 { animation: lp-up 0.4s ease both; }
        .a1 { animation: lp-up 0.4s 0.07s ease both; }
        .a2 { animation: lp-up 0.4s 0.13s ease both; }
        .a3 { animation: lp-up 0.4s 0.19s ease both; }
        .a4 { animation: lp-up 0.4s 0.25s ease both; }

        /* Safe area */
        .lp-safe { height: env(safe-area-inset-bottom, 0px); }

        /* ━━━━ TABLET 768px ━━━━ */
        @media (min-width: 768px) {
          .lp-nav { padding: 22px 40px; }
          .lp-logo-icon { width: 36px; height: 36px; border-radius: 10px; font-size: 17px; }
          .lp-logo-name { font-size: 18px; }

          .lp-body { flex-direction: row; align-items: stretch; }

          /* Left panel appears */
          .lp-left {
            display: flex !important;
            flex-direction: column;
            justify-content: space-between;
            padding: 56px 52px;
            flex: 1;
            border-right: 1px solid rgba(255,255,255,0.05);
          }

          /* Right form panel fixed width */
          .lp-form-section {
            width: 440px; flex: none;
            padding: 56px 52px;
            align-items: center;
          }
          .lp-form-wrap { max-width: 100%; }

          /* Mobile heading hidden, desktop heading shown */
          .lp-mob-head { display: none !important; }
          .lp-desk-head { display: block !important; }

          .lp-card { padding: 32px 28px; }
        }

        /* ━━━━ DESKTOP 1024px ━━━━ */
        @media (min-width: 1024px) {
          .lp-nav { padding: 24px 64px; }
          .lp-left { padding: 72px 72px; }
          .lp-form-section { width: 520px; padding: 72px 72px; }
        }

        /* Left panel (hidden mobile, flex tablet+) */
        .lp-left { display: none; }

        .lp-panel-tag {
          font-size: 11px; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase; color: rgba(110,231,183,0.65);
          margin-bottom: 16px; display: block;
        }
        .lp-panel-h {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(36px, 4vw, 56px);
          line-height: 1.06; color: #f0f0f0;
          letter-spacing: -1.5px; margin-bottom: 20px;
        }
        .lp-panel-h span {
          background: linear-gradient(100deg, #6ee7b7, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .lp-panel-sub {
          font-size: 15px; color: rgba(255,255,255,0.36);
          line-height: 1.75; max-width: 340px;
        }
        .lp-stats { display: flex; gap: 36px; flex-wrap: wrap; }
        .lp-stat-n {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 24px; color: #f0f0f0; letter-spacing: -0.5px;
        }
        .lp-stat-l { font-size: 12px; color: rgba(255,255,255,0.28); margin-top: 3px; }

        /* Desktop heading (hidden on mobile) */
        .lp-desk-head {
          display: none;
          margin-bottom: 34px;
        }
        .lp-desk-head h1 {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 26px; color: #f0f0f0; letter-spacing: -0.7px; margin-bottom: 7px;
        }
        .lp-desk-head p { font-size: 14px; color: rgba(255,255,255,0.36); }
      `}</style>

      {/* Background */}
      <div className="lp-bg-glow1" aria-hidden="true" />
      <div className="lp-bg-glow2" aria-hidden="true" />
      {[16.6, 33.3, 50, 66.6, 83.3].map((v, i) => (
        <div
          key={i}
          className="lp-grid-v"
          style={{ left: `${v}%` }}
          aria-hidden="true"
        />
      ))}
      {[25, 50, 75].map((v, i) => (
        <div
          key={i}
          className="lp-grid-h"
          style={{ top: `${v}%` }}
          aria-hidden="true"
        />
      ))}

      {/* Nav */}
      <nav className="lp-nav a0">
        <Link to="/" className="lp-logo">
          <div className="lp-logo-icon">✦</div>
          <span className="lp-logo-name">Nova</span>
        </Link>
        <Link to="/register" className="lp-nav-link">
          New account →
        </Link>
      </nav>

      {/* Body */}
      <div className="lp-body">
        {/* Left branding — tablet/desktop only */}
        <div className="lp-left">
          <div />
          <div>
            <span className="lp-panel-tag">Project Management</span>
            <h2 className="lp-panel-h">
              Your work,
              <br />
              <span>beautifully</span>
              <br />
              organized.
            </h2>
            <p className="lp-panel-sub">
              Manage projects, track progress, and collaborate — all in one
              workspace built for modern teams.
            </p>
          </div>
          <div className="lp-stats">
            {[
              ["12k+", "Teams"],
              ["98%", "Uptime"],
              ["4.9★", "Rating"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="lp-stat-n">{n}</p>
                <p className="lp-stat-l">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div className="lp-form-section">
          <div className="lp-form-wrap">
            {/* Mobile heading */}
            <div className="lp-mob-head a1">
              <h1>Welcome back</h1>
              <p>Sign in to your Nova workspace</p>
            </div>

            {/* Desktop heading */}
            <div className="lp-desk-head a0">
              <h1>Welcome back</h1>
              <p>Sign in to continue to your workspace</p>
            </div>

            <div className="lp-card a2">
              {error && (
                <div className="lp-err" role="alert">
                  <span aria-hidden="true">⚠</span> {error}
                </div>
              )}
              <form onSubmit={handleSubmit} noValidate>
                <div className="lp-field">
                  <div className="lp-field-row">
                    <label className="lp-label" htmlFor="lp-email">
                      Email address
                    </label>
                  </div>
                  <input
                    id="lp-email"
                    className="lp-input"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </div>
                <div className="lp-field">
                  <div className="lp-field-row">
                    <label className="lp-label" htmlFor="lp-pw">
                      Password
                    </label>
                    <a href="#" className="lp-forgot">
                      Forgot password?
                    </a>
                  </div>
                  <input
                    id="lp-pw"
                    className="lp-input"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                  />
                </div>
                <button type="submit" className="lp-btn" disabled={loading}>
                  {loading ? (
                    <span className="lp-btn-inner">
                      <svg className="lp-spin" viewBox="0 0 24 24" fill="none">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray="31"
                          strokeDashoffset="10"
                          strokeLinecap="round"
                        />
                      </svg>
                      Signing in…
                    </span>
                  ) : (
                    "Sign in →"
                  )}
                </button>
              </form>
            </div>

            <div className="lp-divider a3">
              <div className="lp-div-line" />
              <span className="lp-div-txt">or</span>
              <div className="lp-div-line" />
            </div>

            <p className="lp-bottom a4">
              Don't have an account? <Link to="/register">Create one free</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="lp-safe" aria-hidden="true" />
    </div>
  );
}
