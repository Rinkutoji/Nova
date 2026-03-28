// src/pages/RegisterPage.jsx
import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getStrength(pwd) {
  if (!pwd) return null;
  if (pwd.length < 8) return { label: "Too short", color: "#ef4444", pct: 20 };
  if (pwd.length < 10) return { label: "Weak", color: "#f97316", pct: 40 };
  if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd))
    return { label: "Fair", color: "#eab308", pct: 65 };
  return { label: "Strong", color: "#34d399", pct: 100 };
}

// ── Field component defined outside to avoid re-creation ──
function Field({
  id,
  label,
  name,
  type = "text",
  placeholder,
  value,
  error,
  onChange,
  rightSlot,
}) {
  const [show, setShow] = useState(false);
  const isPwd = type === "password";
  return (
    <div className="rp-field">
      <div className="rp-field-row">
        <label className="rp-label" htmlFor={id}>
          {label}
        </label>
        {rightSlot}
      </div>
      <div style={{ position: "relative" }}>
        {/* font-size 16px prevents iOS auto-zoom */}
        <input
          id={id}
          style={{ paddingRight: isPwd ? "52px" : undefined, fontSize: "16px" }}
          className={`rp-input${error ? " rp-input-err" : ""}`}
          type={isPwd ? (show ? "text" : "password") : type}
          value={value}
          placeholder={placeholder}
          autoComplete={
            name === "password"
              ? "new-password"
              : name === "confirm"
                ? "new-password"
                : name
          }
          inputMode={type === "email" ? "email" : undefined}
          onChange={(e) => onChange(name, e.target.value)}
        />
        {isPwd && (
          <button
            type="button"
            className="rp-show-btn"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "HIDE" : "SHOW"}
          </button>
        )}
      </div>
      {error && (
        <p className="rp-field-err" role="alert">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (form.password.length < 8) e.password = "Minimum 8 characters.";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match.";
    return e;
  };

  const handleChange = useCallback((name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((ev) => ({ ...ev, [name]: "" }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setErrors({
        general:
          err.response?.data?.message || "Registration failed. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);

  return (
    <div className="rp-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Syne:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rp-root {
          min-height: 100vh;
          min-height: 100dvh;
          background: #07080c;
          font-family: 'DM Sans', sans-serif;
          display: flex; flex-direction: column;
          position: relative; overflow-x: hidden;
          color: #f0f0f0;
        }

        /* Bg */
        .rp-glow1 {
          position: fixed; pointer-events: none; z-index: 0;
          top: -20%; left: 50%; transform: translateX(-50%);
          width: min(700px, 130vw); height: 500px;
          background: radial-gradient(ellipse, rgba(129,140,248,0.07) 0%, transparent 65%);
        }
        .rp-glow2 {
          position: fixed; pointer-events: none; z-index: 0;
          bottom: -10%; left: -10%;
          width: 500px; height: 400px;
          background: radial-gradient(ellipse, rgba(52,211,153,0.05) 0%, transparent 65%);
        }
        .rp-gv { position:fixed; pointer-events:none; z-index:0; top:0; bottom:0; width:1px; background:rgba(255,255,255,0.022); }
        .rp-gh { position:fixed; pointer-events:none; z-index:0; left:0; right:0; height:1px; background:rgba(255,255,255,0.022); }

        /* Nav */
        .rp-nav {
          position: relative; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .rp-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
        .rp-logo-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(140deg, #0f172a 0%, #0f172a 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 1px rgba(110,231,183,0.25), 0 0 22px rgba(110,231,183,0.18);
          overflow: hidden; position: relative;
        }
        .rp-logo-icon svg { display:block; }
        .rp-logo-name {
          font-family:'Syne',sans-serif; font-weight:800;
          font-size:17px; color:#f0f0f0; letter-spacing:-0.5px;
        }
        .rp-logo-name em {
          font-style: normal;
          background: linear-gradient(110deg, #6ee7b7, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .rp-nav-link {
          font-size:13px; color:rgba(255,255,255,0.4);
          text-decoration:none; font-weight:500; transition:color 0.2s;
        }
        .rp-nav-link:hover { color:#6ee7b7; }

        /* Scrollable content */
        .rp-scroll {
          flex:1; position:relative; z-index:1;
          overflow-y: auto; -webkit-overflow-scrolling: touch;
          display:flex; align-items:flex-start; justify-content:center;
          padding: 36px 20px 56px;
        }

        .rp-wrap { width:100%; max-width:420px; }

        /* Heading */
        .rp-head { text-align:center; margin-bottom:28px; }
        .rp-head-icon {
          display:inline-flex; width:52px; height:52px; border-radius:15px;
          background: #0f172a;
          align-items:center; justify-content:center;
          margin-bottom:16px;
          box-shadow: 0 0 0 1px rgba(110,231,183,0.2), 0 0 32px rgba(110,231,183,0.15), 0 8px 24px rgba(0,0,0,0.4);
          position: relative; overflow: hidden;
        }
        .rp-head-icon::before {
          content:'';
          position:absolute; inset:0;
          background: linear-gradient(135deg, rgba(110,231,183,0.08) 0%, rgba(129,140,248,0.06) 100%);
        }
        .rp-head h1 {
          font-family:'Syne',sans-serif; font-weight:800;
          font-size:26px; color:#f0f0f0; letter-spacing:-0.7px; margin-bottom:7px;
        }
        .rp-head p { font-size:14px; color:rgba(255,255,255,0.38); }

        /* Card */
        .rp-card {
          background:rgba(255,255,255,0.035);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:18px; padding:28px 24px;
          position:relative; overflow:hidden;
        }
        .rp-card::before {
          content:'';
          position:absolute; top:0; left:15%; right:15%; height:1px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.11),transparent);
        }

        /* Fields */
        .rp-field { margin-bottom:16px; }
        .rp-field:last-of-type { margin-bottom:0; }
        .rp-field-row {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:8px;
        }
        .rp-label {
          font-size:11px; font-weight:600; letter-spacing:0.9px;
          text-transform:uppercase; color:rgba(255,255,255,0.32);
        }

        .rp-input {
          width:100%;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.09);
          color:#f0f0f0; padding:13px 16px;
          border-radius:12px;
          font-family:'DM Sans',sans-serif;
          outline:none; -webkit-appearance:none; appearance:none;
          transition:border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .rp-input::placeholder { color:rgba(255,255,255,0.22); }
        .rp-input:focus {
          border-color:rgba(110,231,183,0.45);
          background:rgba(110,231,183,0.04);
          box-shadow:0 0 0 3px rgba(110,231,183,0.08);
        }
        .rp-input-err {
          border-color:rgba(239,68,68,0.4) !important;
          background:rgba(239,68,68,0.04) !important;
        }
        .rp-input-err:focus {
          border-color:rgba(239,68,68,0.6) !important;
          box-shadow:0 0 0 3px rgba(239,68,68,0.08) !important;
        }

        .rp-show-btn {
          position:absolute; right:13px; top:50%; transform:translateY(-50%);
          background:none; border:none; color:rgba(255,255,255,0.3);
          cursor:pointer; font-size:10px; font-family:'DM Sans',sans-serif;
          font-weight:600; letter-spacing:0.6px; padding:6px;
          transition:color 0.2s; -webkit-tap-highlight-color:transparent;
        }
        .rp-show-btn:hover { color:rgba(255,255,255,0.6); }

        .rp-field-err {
          color:#fca5a5; font-size:12px; margin-top:6px;
          display:flex; align-items:center; gap:4px;
        }

        /* Strength bar */
        .rp-strength { margin-top:8px; }
        .rp-strength-track {
          height:3px; background:rgba(255,255,255,0.08);
          border-radius:99px; overflow:hidden;
        }
        .rp-strength-fill {
          height:100%; border-radius:99px;
          transition:width 0.4s ease, background 0.4s ease;
        }
        .rp-strength-label {
          font-size:11px; font-weight:500; margin-top:5px; letter-spacing:0.3px;
        }

        /* Match */
        .rp-match { font-size:12px; margin-top:6px; display:flex; align-items:center; gap:4px; }

        /* Error alert */
        .rp-alert {
          background:rgba(239,68,68,0.08);
          border:1px solid rgba(239,68,68,0.22);
          color:#fca5a5; font-size:13px;
          padding:11px 14px; border-radius:10px;
          margin-bottom:18px;
          display:flex; align-items:flex-start; gap:8px;
        }

        /* Submit button */
        .rp-btn {
          display:block; width:100%;
          background:linear-gradient(135deg,#6ee7b7,#34d399);
          color:#042c1e; border:none;
          padding:15px; border-radius:12px;
          font-size:15px; font-weight:700;
          font-family:'DM Sans',sans-serif;
          cursor:pointer; margin-top:22px;
          transition:transform 0.18s, box-shadow 0.18s, opacity 0.18s;
          -webkit-tap-highlight-color:transparent;
          touch-action:manipulation;
        }
        .rp-btn:hover { transform:translateY(-1px); box-shadow:0 10px 28px rgba(52,211,153,0.22); }
        .rp-btn:active { transform:scale(0.99); }
        .rp-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; box-shadow:none; }
        .rp-btn-inner { display:flex; align-items:center; justify-content:center; gap:8px; }

        @keyframes rp-spin { to { transform:rotate(360deg); } }
        .rp-spin { width:16px; height:16px; animation:rp-spin 0.8s linear infinite; flex-shrink:0; }

        /* Terms */
        .rp-terms {
          font-size:11px; color:rgba(255,255,255,0.2);
          text-align:center; margin-top:14px; line-height:1.6;
        }
        .rp-terms a { color:rgba(255,255,255,0.38); text-decoration:underline; }

        /* Bottom link */
        .rp-bottom { text-align:center; margin-top:20px; font-size:13px; color:rgba(255,255,255,0.32); }
        .rp-bottom a { color:#6ee7b7; text-decoration:none; font-weight:500; }

        /* Animations */
        @keyframes rp-up {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .b0 { animation:rp-up 0.4s ease both; }
        .b1 { animation:rp-up 0.4s 0.06s ease both; }
        .b2 { animation:rp-up 0.4s 0.11s ease both; }
        .b3 { animation:rp-up 0.4s 0.16s ease both; }
        .b4 { animation:rp-up 0.4s 0.21s ease both; }
        .b5 { animation:rp-up 0.4s 0.26s ease both; }
        .b6 { animation:rp-up 0.4s 0.31s ease both; }

        /* Safe area */
        .rp-safe { height:env(safe-area-inset-bottom, 0px); }

        /* Two-column layout tablet+ */
        @media (min-width: 768px) {
          .rp-nav { padding: 22px 40px; }
          .rp-logo-icon { width:36px; height:36px; border-radius:10px; font-size:17px; }
          .rp-logo-name { font-size:18px; }

          .rp-scroll {
            flex-direction: row;
            align-items: stretch;
            padding: 0;
          }

          /* Left panel */
          .rp-left-panel {
            display: flex !important;
            flex-direction: column;
            justify-content: space-between;
            padding: 60px 52px;
            flex: 1;
            border-right: 1px solid rgba(255,255,255,0.05);
          }

          /* Right scroll area */
          .rp-right-scroll {
            width: 460px; flex: none;
            overflow-y: auto; -webkit-overflow-scrolling: touch;
            padding: 60px 52px;
            display: flex; flex-direction: column; justify-content: center;
          }

          .rp-wrap { max-width: 100%; }
          .rp-head { text-align: left; }
          .rp-head-icon { /* keep centered on mobile, left on desktop */ }
          .rp-card { padding:32px 28px; }
        }

        @media (min-width: 1024px) {
          .rp-nav { padding: 24px 64px; }
          .rp-left-panel { padding: 72px 72px; }
          .rp-right-scroll { width: 520px; padding: 72px 72px; }
        }

        /* Left panel hidden on mobile */
        .rp-left-panel { display: none; }

        .rp-panel-tag {
          font-size:11px; font-weight:600; letter-spacing:2px;
          text-transform:uppercase; color:rgba(110,231,183,0.65);
          margin-bottom:16px; display:block;
        }
        .rp-panel-h {
          font-family:'Syne',sans-serif; font-weight:800;
          font-size:clamp(36px,4vw,54px);
          line-height:1.06; color:#f0f0f0;
          letter-spacing:-1.5px; margin-bottom:20px;
        }
        .rp-panel-h span {
          background:linear-gradient(100deg,#818cf8,#6ee7b7);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .rp-panel-sub {
          font-size:15px; color:rgba(255,255,255,0.36);
          line-height:1.75; max-width:340px;
        }
        .rp-panel-features { margin-top:32px; display:flex; flex-direction:column; gap:14px; }
        .rp-feat {
          display:flex; align-items:center; gap:12px;
          font-size:14px; color:rgba(255,255,255,0.5);
        }
        .rp-feat-dot {
          width:8px; height:8px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,#6ee7b7,#818cf8);
        }
      `}</style>

      {/* Bg */}
      <div className="rp-glow1" aria-hidden="true" />
      <div className="rp-glow2" aria-hidden="true" />
      {[16.6, 33.3, 50, 66.6, 83.3].map((v, i) => (
        <div
          key={i}
          className="rp-gv"
          style={{ left: `${v}%` }}
          aria-hidden="true"
        />
      ))}
      {[25, 50, 75].map((v, i) => (
        <div
          key={i}
          className="rp-gh"
          style={{ top: `${v}%` }}
          aria-hidden="true"
        />
      ))}

      {/* Nav */}
      <nav className="rp-nav b0">
        <Link to="/" className="rp-logo">
          <div className="rp-logo-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 2L19.5 7V15L11 20L2.5 15V7L11 2Z"
                fill="url(#rg1)"
                stroke="rgba(110,231,183,0.3)"
                strokeWidth="0.5"
              />
              <path
                d="M11 5.5L16.5 8.75V15.25L11 18.5L5.5 15.25V8.75L11 5.5Z"
                fill="rgba(255,255,255,0.06)"
              />
              <circle cx="11" cy="11" r="3" fill="url(#rg2)" />
              <circle cx="11" cy="11" r="1.2" fill="white" opacity="0.9" />
              <defs>
                <linearGradient
                  id="rg1"
                  x1="2.5"
                  y1="2"
                  x2="19.5"
                  y2="20"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#6ee7b7" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
                <linearGradient
                  id="rg2"
                  x1="8"
                  y1="8"
                  x2="14"
                  y2="14"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#6ee7b7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="rp-logo-name">
            No<em>va</em>
          </span>
        </Link>
        <Link to="/login" className="rp-nav-link">
          Sign in →
        </Link>
      </nav>

      {/* Main scroll area */}
      <div className="rp-scroll">
        {/* Left branding panel (tablet/desktop) */}
        <div className="rp-left-panel">
          <div />
          <div>
            <span className="rp-panel-tag">Get started today</span>
            <h2 className="rp-panel-h">
              Everything you
              <br />
              need to <span>ship faster</span>.
            </h2>
            <p className="rp-panel-sub">
              Join thousands of teams who use Nova to plan, build, and deliver
              great products together.
            </p>
            <div className="rp-panel-features">
              {[
                "Unlimited projects & tasks",
                "Real-time collaboration",
                "Smart notifications",
                "Secure by default",
              ].map((f) => (
                <div key={f} className="rp-feat">
                  <div className="rp-feat-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
            Free forever. No credit card required.
          </p>
        </div>

        {/* Right form */}
        <div className="rp-right-scroll">
          <div className="rp-wrap">
            <div className="rp-head b1">
              <div className="rp-head-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 2L19.5 7V15L11 20L2.5 15V7L11 2Z"
                    fill="url(#hg1)"
                    stroke="rgba(110,231,183,0.4)"
                    strokeWidth="0.5"
                  />
                  <path
                    d="M11 5.5L16.5 8.75V15.25L11 18.5L5.5 15.25V8.75L11 5.5Z"
                    fill="rgba(255,255,255,0.07)"
                  />
                  <circle cx="11" cy="11" r="3" fill="url(#hg2)" />
                  <circle cx="11" cy="11" r="1.2" fill="white" opacity="0.95" />
                  <defs>
                    <linearGradient
                      id="hg1"
                      x1="2.5"
                      y1="2"
                      x2="19.5"
                      y2="20"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#6ee7b7" />
                      <stop offset="55%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                    <linearGradient
                      id="hg2"
                      x1="8"
                      y1="8"
                      x2="14"
                      y2="14"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#6ee7b7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h1>Create your account</h1>
              <p>Free forever. No credit card required.</p>
            </div>

            <div className="rp-card b2">
              {errors.general && (
                <div className="rp-alert" role="alert">
                  <span aria-hidden="true">⚠</span> {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="b3">
                  <Field
                    id="rp-name"
                    label="Full Name"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    error={errors.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="b4">
                  <Field
                    id="rp-email"
                    label="Work Email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    error={errors.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="b5">
                  <Field
                    id="rp-pw"
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Min 8 characters"
                    value={form.password}
                    error={errors.password}
                    onChange={handleChange}
                  />

                  {form.password && strength && (
                    <div className="rp-strength">
                      <div className="rp-strength-track">
                        <div
                          className="rp-strength-fill"
                          style={{
                            width: `${strength.pct}%`,
                            background: strength.color,
                            boxShadow: `0 0 8px ${strength.color}55`,
                          }}
                        />
                      </div>
                      <p
                        className="rp-strength-label"
                        style={{ color: strength.color }}
                      >
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                <div className="b6">
                  <Field
                    id="rp-confirm"
                    label="Confirm Password"
                    name="confirm"
                    type="password"
                    placeholder="Repeat password"
                    value={form.confirm}
                    error={errors.confirm}
                    onChange={handleChange}
                  />

                  {form.confirm && !errors.confirm && (
                    <p
                      className="rp-match"
                      style={{
                        color:
                          form.password === form.confirm
                            ? "#34d399"
                            : "#f87171",
                      }}
                    >
                      {form.password === form.confirm
                        ? "✓ Passwords match"
                        : "✗ Passwords don't match"}
                    </p>
                  )}
                </div>

                <button type="submit" className="rp-btn" disabled={loading}>
                  {loading ? (
                    <span className="rp-btn-inner">
                      <svg className="rp-spin" viewBox="0 0 24 24" fill="none">
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
                      Creating account…
                    </span>
                  ) : (
                    "Create free account →"
                  )}
                </button>
              </form>

              <p className="rp-terms">
                By signing up, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
              </p>
            </div>

            <p className="rp-bottom b6">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="rp-safe" aria-hidden="true" />
    </div>
  );
}
