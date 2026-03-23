import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// GLOBAL CSS — Mobile-first, fully responsive
// ─────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; }
  .font-syne { font-family: 'Syne', sans-serif !important; }
  .font-dm   { font-family: 'DM Sans', sans-serif !important; }
  body { font-family: 'DM Sans', sans-serif; }
  .nova-root, .nova-root * { transition: background-color .3s, border-color .3s, color .2s; }
  .nova-root {
    --bg:#0a0b0f; --surface:#111318; --surface2:#181c24; --surface3:#1e2330;
    --border:rgba(255,255,255,0.07); --text:#e2e8f0; --muted:#64748b;
    --topbar:rgba(10,11,15,0.95);
  }
  .nova-root.light {
    --bg:#f1f5f9; --surface:#ffffff; --surface2:#f8fafc; --surface3:#f1f5f9;
    --border:rgba(0,0,0,0.08); --text:#0f172a; --muted:#64748b;
    --topbar:rgba(255,255,255,0.96);
  }
  .nova-root { background:var(--bg); color:var(--text); }
  .nova-sidebar { background:var(--surface); border-color:var(--border); }
  .nova-topbar  { background:var(--topbar); border-color:var(--border); }
  .nova-card    { background:var(--surface); border-color:var(--border); }
  .nova-s2      { background:var(--surface2); }
  .nova-s3      { background:var(--surface3); }
  .nova-border  { border-color:var(--border) !important; }
  .nova-text    { color:var(--text); }
  .nova-muted   { color:var(--muted); }
  .nova-input   { background:var(--surface2); border-color:var(--border); color:var(--text); }
  .nova-root.light select option { background:#f8fafc; color:#0f172a; }
  select option { background:#181c24; }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
  @keyframes growUp  { from{transform:scaleY(0);transform-origin:bottom} to{transform:scaleY(1)} }
  @keyframes fillBar { from{width:0!important} }
  @keyframes toastIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
  @keyframes toastOut{ to{opacity:0;transform:translateX(20px)} }
  @keyframes modalIn { from{opacity:0;transform:translateY(16px) scale(.97)} to{opacity:1;transform:none} }
  @keyframes slideUp { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:none} }
  @keyframes slideDown { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(100%)} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes overlayIn { from{opacity:0} to{opacity:1} }

  .afu { animation:fadeUp .35s ease both; }
  .agU { animation:growUp .7s cubic-bezier(.22,1,.36,1) both; }
  .afB { animation:fillBar 1s cubic-bezier(.22,1,.36,1) both; }
  .aTI { animation:toastIn .3s cubic-bezier(.22,1,.36,1); }
  .aTO { animation:toastOut .3s ease forwards; }
  .aMI { animation:modalIn .25s cubic-bezier(.22,1,.36,1); }
  .aSU { animation:slideUp .3s cubic-bezier(.22,1,.36,1); }
  .aSD { animation:slideDown .25s ease forwards; }
  .aOI { animation:overlayIn .2s ease; }
  .pulse { animation:pulse 2s infinite; }

  .scrollbar-thin::-webkit-scrollbar { width:3px; }
  .scrollbar-thin::-webkit-scrollbar-thumb { background:#2a2f3e; border-radius:2px; }
  .nova-root.light .scrollbar-thin::-webkit-scrollbar-thumb { background:#cbd5e1; }
  .toggle-track { transition:background .25s; }
  .toggle-thumb { transition:transform .25s; }
  .hrow:hover { background:rgba(255,255,255,0.025); }
  .nova-root.light .hrow:hover { background:rgba(0,0,0,0.025); }

  /* Mobile bottom nav safe area */
  .mobile-nav-safe { padding-bottom:env(safe-area-inset-bottom, 8px); }

  /* Touch-friendly tap targets */
  @media (max-width: 768px) {
    .tap-target { min-height: 44px; min-width: 44px; }
  }

  /* Responsive table: hide columns on mobile */
  @media (max-width: 640px) {
    .hide-mobile { display: none !important; }
  }
  @media (max-width: 768px) {
    .hide-tablet { display: none !important; }
  }
`;

// ─────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────
const DEFAULT_INVOICES = [
  { id: "INV-2025-003", date: "Mar 20, 2025", amount: 49 },
  { id: "INV-2025-002", date: "Feb 20, 2025", amount: 49 },
  { id: "INV-2025-001", date: "Jan 20, 2025", amount: 49 },
  { id: "INV-2024-012", date: "Dec 20, 2024", amount: 49 },
];

const CHART_DATA = [
  { l: "Jan", a: 55, b: 38 },
  { l: "Feb", a: 62, b: 42 },
  { l: "Mar", a: 48, b: 30 },
  { l: "Apr", a: 70, b: 55 },
  { l: "May", a: 80, b: 62 },
  { l: "Jun", a: 73, b: 58 },
  { l: "Jul", a: 91, b: 72 },
  { l: "Aug", a: 85, b: 68 },
  { l: "Sep", a: 78, b: 60 },
  { l: "Oct", a: 95, b: 80 },
  { l: "Nov", a: 88, b: 70 },
  { l: "Dec", a: 100, b: 84 },
];

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const downloadCSV = (filename, rows) => {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────
const Pill = ({ color, children }) => {
  const cls =
    {
      green: "bg-emerald-400/10 text-emerald-400",
      orange: "bg-orange-400/10 text-orange-400",
      gray: "bg-slate-500/10 text-slate-400",
      red: "bg-red-400/10 text-red-400",
      purple: "bg-indigo-400/10 text-indigo-400",
    }[color] || "bg-slate-500/10 text-slate-400";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.68rem] font-semibold ${cls}`}
    >
      {children}
    </span>
  );
};

const Tag = ({ children }) => (
  <span className="inline-block px-2 py-0.5 bg-[#181c24] rounded text-[0.67rem] text-slate-400 mr-1">
    {children}
  </span>
);

const Btn = ({
  variant = "primary",
  size = "md",
  onClick,
  disabled,
  children,
  className = "",
}) => {
  const base =
    "inline-flex items-center gap-1.5 font-dm font-medium rounded-[9px] cursor-pointer transition-all duration-200 border-0 whitespace-nowrap tap-target";
  const S = {
    sm: "px-3.5 py-1.5 text-[0.75rem]",
    md: "px-4 py-2.5 text-[0.82rem]",
  };
  const V = {
    primary:
      "bg-emerald-400 text-[#0a0b0f] font-semibold hover:bg-emerald-300 active:scale-95 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(110,231,183,.25)]",
    ghost:
      "bg-transparent text-slate-200 border border-white/[0.07] hover:bg-[#181c24] active:scale-95",
    danger:
      "bg-red-400/10 text-red-400 border border-red-400/30 hover:bg-red-400/20 active:scale-95",
    icon: "bg-[#181c24] text-slate-400 border border-white/[0.07] hover:bg-[#1e2330] hover:text-slate-200 w-9 h-9 justify-center p-0",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${S[size] || S.md} ${V[variant] || V.ghost} ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

const Toggle = ({ on, onChange }) => (
  <div
    onClick={onChange}
    className={`w-[42px] h-6 rounded-full cursor-pointer relative toggle-track border flex-shrink-0 ${on ? "bg-emerald-400 border-emerald-400" : "bg-[#181c24] border-white/[0.07]"}`}
  >
    <div
      className={`toggle-thumb absolute top-[3px] w-4 h-4 rounded-full ${on ? "bg-[#0a0b0f] translate-x-[19px]" : "bg-white translate-x-[3px]"}`}
    />
  </div>
);

const Field = ({ label, required, error, children }) => (
  <div className="mb-4">
    <label className="block text-[0.78rem] font-medium text-slate-400 mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && <div className="text-[0.72rem] text-red-400 mt-1">{error}</div>}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className={`nova-input w-full border ${props.hasError ? "border-red-400" : "nova-border"} px-3.5 py-2.5 rounded-[10px] text-[0.85rem] outline-none focus:border-emerald-400 placeholder:text-slate-400 transition-colors font-dm ${props.className || ""}`}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className="nova-input nova-border w-full border px-3.5 py-2.5 rounded-[10px] text-[0.85rem] outline-none focus:border-emerald-400 placeholder:text-slate-400 transition-colors resize-y min-h-[80px] font-dm"
  />
);

const Sel = ({ children, ...props }) => (
  <select
    {...props}
    className={`nova-input nova-border w-full border px-3.5 py-2.5 rounded-[10px] text-[0.83rem] outline-none cursor-pointer font-dm ${props.className || ""}`}
  >
    {children}
  </select>
);

const ProgBar = ({ label, pct, color = "#6ee7b7" }) => (
  <div className="mb-4">
    <div className="flex justify-between text-[0.78rem] mb-1.5">
      <span className="font-medium nova-text truncate pr-2">{label}</span>
      <span className="nova-muted flex-shrink-0">{pct}%</span>
    </div>
    <div className="h-1.5 nova-s2 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full afB"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  </div>
);

const StatCard = ({ label, value, icon, bg, change, period, up }) => (
  <div className="nova-card border rounded-2xl p-4 sm:p-5 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,.2)] transition-all cursor-default">
    <div className="flex items-center justify-between">
      <span className="text-[0.75rem] nova-muted">{label}</span>
      <div
        className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[0.95rem] flex-shrink-0"
        style={{ background: bg }}
      >
        {icon}
      </div>
    </div>
    <div className="font-syne text-[1.4rem] sm:text-[1.6rem] font-black tracking-tight leading-none nova-text">
      {value}
    </div>
    <div className="flex items-center gap-1.5 text-[0.72rem]">
      <span className={up ? "text-emerald-400" : "text-red-400"}>{change}</span>
      <span className="nova-muted">{period}</span>
    </div>
  </div>
);

const Card = ({ title, action, onAction, children, noPad }) => (
  <div className="nova-card border rounded-2xl overflow-hidden">
    {title && (
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 nova-border border-b">
        <div className="font-syne font-bold text-[0.9rem] nova-text">
          {title}
        </div>
        {action && (
          <button
            onClick={onAction}
            className="text-[0.75rem] text-emerald-400 hover:text-emerald-300 transition-colors ml-2 flex-shrink-0"
          >
            {action}
          </button>
        )}
      </div>
    )}
    <div className={noPad ? "" : "p-4 sm:p-5"}>{children}</div>
  </div>
);

const BarChart = ({ c1 = "#6ee7b7", c2 = "#818cf8" }) => (
  <div className="h-32 sm:h-40 flex items-end gap-1 sm:gap-2 pb-1">
    {CHART_DATA.map((d, i) => (
      <div key={d.l} className="flex-1 flex flex-col items-center gap-1.5">
        <div className="flex gap-0.5 items-end w-full">
          <div
            className="flex-1 rounded-t-[4px] cursor-pointer hover:opacity-75 agU"
            style={{
              height: `${(d.a / 100) * 128}px`,
              background: c1,
              animationDelay: `${i * 0.04}s`,
            }}
          />
          <div
            className="flex-1 rounded-t-[4px] cursor-pointer hover:opacity-75 agU"
            style={{
              height: `${(d.b / 100) * 128}px`,
              background: c2,
              animationDelay: `${i * 0.04 + 0.02}s`,
            }}
          />
        </div>
        <span className="text-[0.55rem] sm:text-[0.6rem] text-slate-500">
          {d.l}
        </span>
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────
// MODAL — mobile bottom-sheet on small screens
// ─────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, footer, large }) => {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", h);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center aOI"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Mobile: full-width bottom sheet; Desktop: centered dialog */}
      <div
        className={`nova-card border w-full overflow-hidden aSU sm:aMI
        rounded-t-3xl sm:rounded-2xl
        ${large ? "sm:max-w-[620px]" : "sm:max-w-[480px]"}
        max-h-[92dvh] sm:max-h-[85vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 nova-border border-b flex-shrink-0">
          {/* Mobile drag handle */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-600 sm:hidden" />
          <div className="font-syne font-bold text-[1rem] nova-text pt-1 sm:pt-0">
            {title}
          </div>
          <button
            onClick={onClose}
            className="nova-s2 nova-border w-8 h-8 rounded-lg border flex items-center justify-center nova-muted hover:nova-text transition-all text-sm flex-shrink-0"
          >
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto scrollbar-thin flex-1">
          {children}
        </div>
        {footer && (
          <div className="px-5 py-4 nova-border border-t nova-s2 flex justify-end gap-2.5 flex-shrink-0 mobile-nav-safe">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CONFIRM DIALOG
// ─────────────────────────────────────────────
const Confirm = ({ open, config = {}, onClose, onConfirm }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4 aOI"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="nova-card border rounded-2xl p-7 w-full max-w-[380px] text-center aMI">
        <div className="text-4xl mb-4">{config.ico}</div>
        <div className="font-syne font-bold text-lg mb-2 nova-text">
          {config.title}
        </div>
        <div className="text-sm nova-muted leading-relaxed mb-6">
          {config.msg}
        </div>
        <div className="flex gap-3 justify-center">
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="danger" onClick={onConfirm}>
            {config.btn}
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
const TBORDER = {
  success: "border-emerald-400/25",
  error: "border-red-400/25",
  info: "border-indigo-400/25",
  warning: "border-orange-400/25",
};
const TICON = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };

const ToastItem = ({ toast, onRemove }) => {
  const [out, setOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      setOut(true);
      setTimeout(onRemove, 300);
    }, toast.dur || 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className={`nova-card flex items-center gap-3 border ${TBORDER[toast.type]} rounded-xl px-4 py-3.5 min-w-[260px] max-w-[320px] sm:max-w-[340px] shadow-[0_8px_32px_rgba(0,0,0,.3)] pointer-events-auto ${out ? "aTO" : "aTI"}`}
    >
      <span className="text-lg flex-shrink-0">{TICON[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[0.83rem] font-semibold mb-0.5 nova-text">
          {toast.title}
        </div>
        <div className="text-[0.72rem] nova-muted truncate">{toast.msg}</div>
      </div>
      <button
        onClick={() => {
          setOut(true);
          setTimeout(onRemove, 300);
        }}
        className="nova-muted hover:nova-text text-sm flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────
// PAGE: OVERVIEW
// ─────────────────────────────────────────────
const OverviewPage = ({ projects, members, notifs, navigate }) => {
  const now = new Date();
  const hour = now.getHours();
  const greet =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const active = projects.filter((p) => p.status === "active").length;

  return (
    <div className="afu">
      {/* Header — stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="font-syne font-black text-[1.25rem] sm:text-[1.4rem] tracking-tight mb-1">
            {greet}, Seavmeng 👋
          </h2>
          <p className="text-slate-400 text-sm">
            {now.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            — Here's what's happening today.
          </p>
        </div>
        <Btn
          variant="primary"
          onClick={() => navigate("projects")}
          className="self-start sm:self-auto"
        >
          ＋ New Project
        </Btn>
      </div>

      {/* Stat cards — 2-col on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          label="Total Revenue"
          value={`$${(84.2 + projects.length * 1.2).toFixed(1)}K`}
          icon="💰"
          bg="rgba(110,231,183,.1)"
          change="↑ 12.5%"
          period="vs last month"
          up
        />
        <StatCard
          label="Active Users"
          value={String(3471 + members.length * 10)}
          icon="👥"
          bg="rgba(129,140,248,.1)"
          change="↑ 8.1%"
          period="vs last month"
          up
        />
        <StatCard
          label="Active Projects"
          value={String(active)}
          icon="⬡"
          bg="rgba(251,146,60,.1)"
          change={active > 2 ? "↑ Growing" : "↓ Low"}
          period="of total"
          up={active > 2}
        />
        <StatCard
          label="Team Members"
          value={String(members.length)}
          icon="👤"
          bg="rgba(248,113,113,.1)"
          change="↑ 2 new"
          period="this month"
          up
        />
      </div>

      {/* Main grid — stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] gap-4 mb-4">
        <Card
          title="Revenue & Orders"
          action="Full report →"
          onAction={() => navigate("analytics")}
        >
          <BarChart />
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-[0.72rem] text-slate-400">
              <div className="w-2 h-2 rounded-sm bg-emerald-400" />
              Revenue
            </div>
            <div className="flex items-center gap-1.5 text-[0.72rem] text-slate-400">
              <div className="w-2 h-2 rounded-sm bg-indigo-400" />
              Orders
            </div>
          </div>
        </Card>
        <Card
          title="Recent Activity"
          action="View all"
          onAction={() => navigate("notifications")}
        >
          {notifs.length === 0 && (
            <p className="text-sm nova-muted text-center py-4">
              No recent activity.
            </p>
          )}
          {notifs.slice(0, 4).map((n) => {
            const ico = n.ico || n.icon || "🔔";
            const bg = n.bg || n.bgColor || "rgba(100,116,139,.1)";
            const msg = n.msg || n.message || "";
            const t =
              n.time ||
              (n.createdAt ? new Date(n.createdAt).getTime() : Date.now());
            return (
              <div
                key={n.id}
                onClick={() => navigate("notifications")}
                className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0 hrow -mx-4 sm:-mx-5 px-4 sm:px-5 rounded-lg cursor-pointer transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-[9px] flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: bg }}
                >
                  {ico}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.82rem] font-medium truncate">
                    {n.title}
                  </div>
                  <div className="text-[0.7rem] text-slate-400 truncate">
                    {msg}
                  </div>
                </div>
                <div className="text-[0.68rem] text-slate-500 flex-shrink-0">
                  {timeAgo(t)}
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          title="Project Progress"
          action="Manage →"
          onAction={() => navigate("projects")}
        >
          {projects.length === 0 && (
            <p className="text-sm nova-muted text-center py-2">
              No projects yet.
            </p>
          )}
          {projects.slice(0, 4).map((p) => (
            <ProgBar
              key={p.id}
              label={p.title}
              pct={p.progress || p.pct || 0}
              color={p.color || "#6ee7b7"}
            />
          ))}
        </Card>
        <Card
          title="Team Activity"
          action="View team →"
          onAction={() => navigate("team")}
          noPad
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[280px]">
              <thead>
                <tr>
                  {["Member", "Role", "Activity"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[0.68rem] font-medium text-slate-400 uppercase tracking-wider px-3 py-2.5 border-b border-white/[0.07]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.slice(0, 5).map((m) => (
                  <tr key={m.id} className="hrow">
                    <td className="px-3 py-2.5 text-[0.82rem] font-medium border-b border-white/[0.04]">
                      {m.name.split(" ")[0]}
                    </td>
                    <td className="px-3 py-2.5 border-b border-white/[0.04] hide-mobile">
                      <Tag>{m.role.split(" ")[0]}</Tag>
                    </td>
                    <td className="px-3 py-2.5 border-b border-white/[0.04]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 nova-s2 rounded-full overflow-hidden min-w-[40px]">
                          <div
                            className="h-full rounded-full bg-emerald-400"
                            style={{ width: `${m.activity}%` }}
                          />
                        </div>
                        <span className="text-[0.72rem] text-emerald-400 flex-shrink-0">
                          {m.activity}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// PAGE: ANALYTICS
// ─────────────────────────────────────────────
const AnalyticsPage = ({ showToast }) => {
  const [range, setRange] = useState("monthly");
  return (
    <div className="afu">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <div className="font-syne font-black text-2xl tracking-tight">
          Analytics
        </div>
        <div className="flex gap-2">
          <Sel
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-auto text-[0.78rem]"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Sel>
          <Btn
            variant="ghost"
            size="sm"
            onClick={() => {
              downloadCSV("analytics.csv", [
                ["Month", "Sessions", "Conversions"],
                ...CHART_DATA.map((d) => [d.l, d.a, d.b]),
              ]);
              showToast("success", "Exported!", "analytics.csv downloaded.");
            }}
          >
            ⬇ Export
          </Btn>
        </div>
      </div>
      <p className="text-slate-400 text-sm mb-6">
        Deep dive into your performance metrics.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          label="Page Views"
          value="1.2M"
          icon="👁"
          bg="rgba(110,231,183,.1)"
          change="↑ 18%"
          period="this month"
          up
        />
        <StatCard
          label="Bounce Rate"
          value="34.2%"
          icon="↩"
          bg="rgba(248,113,113,.1)"
          change="↑ 2.1%"
          period="this month"
        />
        <StatCard
          label="New Visitors"
          value="8,940"
          icon="🌐"
          bg="rgba(129,140,248,.1)"
          change="↑ 6.4%"
          period="this month"
          up
        />
        <StatCard
          label="Goals Done"
          value="412"
          icon="🎯"
          bg="rgba(251,146,60,.1)"
          change="↑ 11%"
          period="this month"
          up
        />
      </div>
      <Card title="Traffic Overview — 2025">
        <div className="flex gap-2 mb-4 flex-wrap">
          <Btn
            variant="ghost"
            size="sm"
            onClick={() => {
              try {
                navigator.clipboard.writeText(window.location.href);
              } catch (e) {}
              showToast("success", "Copied!", "Chart link copied.");
            }}
          >
            🔗 Share
          </Btn>
          <Btn
            variant="ghost"
            size="sm"
            onClick={() =>
              showToast("info", "Tip", "Right-click chart → Save Image As.")
            }
          >
            ⬇ PNG
          </Btn>
        </div>
        <BarChart c1="#6ee7b7" c2="#fb923c" />
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-[0.72rem] text-slate-400">
            <div className="w-2 h-2 rounded-sm bg-emerald-400" />
            Sessions
          </div>
          <div className="flex items-center gap-1.5 text-[0.72rem] text-slate-400">
            <div className="w-2 h-2 rounded-sm bg-orange-400" />
            Conversions
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <Card title="Top Pages" noPad>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[280px]">
              <thead>
                <tr>
                  {["Page", "Views", "Avg Time"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[0.68rem] font-medium text-slate-400 uppercase tracking-wider px-3 py-2.5 border-b border-white/[0.07]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["/dashboard", "42,100", "4m 12s"],
                  ["/analytics", "28,500", "6m 44s"],
                  ["/pricing", "18,200", "2m 10s"],
                  ["/blog/ai-trends", "14,800", "7m 30s"],
                  ["/signup", "9,400", "1m 55s"],
                ].map(([p, v, t], i) => (
                  <tr key={i} className="hrow">
                    <td className="px-3 py-3 text-[0.82rem] border-b border-white/[0.04] text-emerald-400/80">
                      {p}
                    </td>
                    <td className="px-3 py-3 text-[0.82rem] border-b border-white/[0.04]">
                      {v}
                    </td>
                    <td className="px-3 py-3 text-[0.82rem] border-b border-white/[0.04] text-slate-400 hide-mobile">
                      {t}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Traffic Sources">
          <ProgBar label="Organic Search" pct={46} color="#6ee7b7" />
          <ProgBar label="Direct" pct={28} color="#818cf8" />
          <ProgBar label="Social Media" pct={15} color="#fb923c" />
          <ProgBar label="Referral" pct={11} color="#f87171" />
        </Card>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// PAGE: PROJECTS
// ─────────────────────────────────────────────
const ProjectsPage = ({
  projects,
  onCreateProject,
  onUpdateProject,
  onPatchProjectStatus,
  onDeleteProject,
  showToast,
}) => {
  const BLANK = { title: "", desc: "", status: "active", due: "", pct: "0" };
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setForm(BLANK);
    setErr("");
    setModal("new");
  };
  const openEdit = (p) => {
    setForm({
      title: p.title,
      desc: p.description || "",
      status: p.status?.toLowerCase() || "active",
      due: p.dueDate || "",
      pct: String(p.progress || 0),
    });
    setErr("");
    setModal(p);
  };

  const save = async () => {
    if (!form.title.trim()) {
      setErr("Project name is required.");
      return;
    }
    const COLORS = ["#6ee7b7", "#818cf8", "#fb923c", "#f87171", "#34d399"];
    setSaving(true);
    try {
      if (modal === "new") {
        const payload = {
          title: form.title,
          description: form.desc,
          status: form.status.toUpperCase(),
          progress: Math.min(100, Math.max(0, Number(form.pct) || 0)),
          color: COLORS[projects.length % COLORS.length],
          dueDate: form.due || null,
        };
        await onCreateProject(payload);
        showToast("success", "Project Created!", `"${form.title}" added.`);
      } else {
        const payload = {
          title: form.title,
          description: form.desc,
          status: form.status.toUpperCase(),
          progress: Math.min(100, Math.max(0, Number(form.pct) || 0)),
          dueDate: form.due || null,
        };
        await onUpdateProject(modal.id, payload);
        showToast("success", "Saved!", "Project updated.");
      }
      setModal(null);
    } catch (e) {
      showToast(
        "error",
        "Error",
        e.response?.data?.message || "Failed to save.",
      );
    } finally {
      setSaving(false);
    }
  };

  const del = (p) =>
    setConfirm({
      ico: "🗑",
      title: "Delete Project?",
      msg: `"${p.title}" will be permanently removed.`,
      btn: "Delete Project",
      cb: async () => {
        try {
          await onDeleteProject(p.id);
          showToast("success", "Deleted!", `"${p.title}" removed.`);
        } catch (e) {
          showToast("error", "Error", "Failed to delete.");
        }
        setConfirm(null);
      },
    });

  const changeStatus = async (p, status) => {
    try {
      await onPatchProjectStatus(p.id, status.toUpperCase());
      showToast("info", "Updated", `Status → ${status}.`);
    } catch (e) {
      showToast("error", "Error", "Failed to update status.");
    }
  };

  return (
    <div className="afu">
      <div className="flex items-center justify-between mb-1">
        <div className="font-syne font-black text-2xl tracking-tight">
          Projects
        </div>
        <Btn variant="primary" onClick={openNew}>
          ＋ New
        </Btn>
      </div>
      <p className="text-slate-400 text-sm mb-6">
        {projects.length} projects ·{" "}
        {projects.filter((p) => p.status === "active").length} active.
      </p>

      {projects.length === 0 && (
        <div className="nova-card border rounded-2xl p-10 sm:p-16 text-center">
          <div className="text-5xl mb-4">⬡</div>
          <div className="font-syne font-bold text-lg mb-2">
            No projects yet
          </div>
          <p className="text-slate-400 text-sm mb-5">
            Create your first project to get started.
          </p>
          <Btn variant="primary" onClick={openNew}>
            ＋ New Project
          </Btn>
        </div>
      )}

      {/* 1 col on mobile, 2 col on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="nova-card border rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,.15)] transition-all"
          >
            <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3.5 nova-border border-b gap-2">
              <div className="font-syne font-bold text-[0.9rem] nova-text truncate">
                {p.title}
              </div>
              <Sel
                value={p.status?.toLowerCase() || "active"}
                onChange={(e) => changeStatus(p, e.target.value)}
                className="w-auto text-[0.72rem] py-1 px-2 flex-shrink-0"
              >
                <option value="active">Active</option>
                <option value="review">In Review</option>
                <option value="paused">Paused</option>
              </Sel>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-[0.8rem] nova-muted mb-4 min-h-[2.5rem]">
                {p.description || "No description."}
              </p>
              <ProgBar
                label="Progress"
                pct={p.progress || 0}
                color={p.color || "#6ee7b7"}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="text-[0.72rem] text-slate-500">
                  📅 {p.dueDate || "No due date"}
                </div>
                <div className="flex gap-1.5">
                  <Btn
                    variant="icon"
                    size="sm"
                    onClick={() => openEdit(p)}
                    title="Edit"
                  >
                    ✏️
                  </Btn>
                  <Btn
                    variant="icon"
                    size="sm"
                    onClick={() => del(p)}
                    title="Delete"
                  >
                    🗑
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div
          className="nova-border border border-dashed rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:border-emerald-400/40 transition-colors min-h-[180px]"
          onClick={openNew}
        >
          <div className="text-3xl text-slate-500">＋</div>
          <div className="font-semibold text-[0.85rem]">New Project</div>
          <div className="text-[0.72rem] text-slate-500">
            Start something new
          </div>
        </div>
      </div>

      <Modal
        open={!!modal}
        onClose={() => !saving && setModal(null)}
        title={modal === "new" ? "＋ New Project" : "✏️ Edit Project"}
        footer={
          <>
            <Btn
              variant="ghost"
              onClick={() => setModal(null)}
              disabled={saving}
            >
              Cancel
            </Btn>
            <Btn variant="primary" onClick={save} disabled={saving}>
              {saving
                ? "Saving…"
                : modal === "new"
                  ? "Create Project"
                  : "Save Changes"}
            </Btn>
          </>
        }
      >
        <Field label="Project Name" required error={err}>
          <Input
            value={form.title}
            onChange={(e) => {
              setForm((f) => ({ ...f, title: e.target.value }));
              setErr("");
            }}
            placeholder="e.g. Marketing Website v2"
            hasError={!!err}
          />
        </Field>
        <Field label="Description">
          <Textarea
            value={form.desc}
            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            placeholder="Brief description…"
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Status">
            <Sel
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="active">Active</option>
              <option value="review">In Review</option>
              <option value="paused">Paused</option>
            </Sel>
          </Field>
          <Field label="Progress (%)">
            <Input
              type="number"
              min={0}
              max={100}
              value={form.pct}
              onChange={(e) => setForm((f) => ({ ...f, pct: e.target.value }))}
              placeholder="0–100"
            />
          </Field>
          <Field label="Due Date">
            <Input
              type="date"
              value={form.due}
              onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))}
            />
          </Field>
        </div>
      </Modal>

      <Confirm
        open={!!confirm}
        config={confirm || {}}
        onClose={() => setConfirm(null)}
        onConfirm={confirm?.cb}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// PAGE: REPORTS
// ─────────────────────────────────────────────
const ReportsPage = ({ showToast }) => {
  const DEFAULT_REPORTS = [
    {
      id: 1,
      name: "Q1 Revenue Summary",
      type: "Financial",
      period: "Jan–Mar 2025",
      status: "ready",
      gen: "Mar 18",
    },
    {
      id: 2,
      name: "User Growth Report",
      type: "Growth",
      period: "Feb 2025",
      status: "ready",
      gen: "Mar 15",
    },
    {
      id: 3,
      name: "Campaign Performance",
      type: "Marketing",
      period: "Mar 2025",
      status: "processing",
      gen: "—",
    },
    {
      id: 4,
      name: "Churn Analysis",
      type: "Retention",
      period: "Q1 2025",
      status: "ready",
      gen: "Mar 10",
    },
    {
      id: 5,
      name: "Infrastructure Costs",
      type: "DevOps",
      period: "Mar 2025",
      status: "failed",
      gen: "—",
    },
    {
      id: 6,
      name: "SEO Performance",
      type: "Marketing",
      period: "Q1 2025",
      status: "ready",
      gen: "Mar 5",
    },
  ];
  const [reports, setReports] = useState(DEFAULT_REPORTS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "Financial",
    period: "This Month",
  });
  const [err, setErr] = useState("");

  const simulate = (id, name) => {
    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "ready",
                gen: new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
              }
            : r,
        ),
      );
      showToast("success", "Report Ready!", `"${name}" is now available.`);
    }, 3000);
  };

  const generate = () => {
    if (!form.name.trim()) {
      setErr("Report name is required.");
      return;
    }
    const nr = {
      id: Date.now(),
      name: form.name,
      type: form.type,
      period: form.period,
      status: "processing",
      gen: "—",
    };
    setReports((u) => [...u, nr]);
    setModal(false);
    setErr("");
    showToast("success", "Queued!", "Report is being generated…");
    simulate(nr.id, nr.name);
  };

  const retry = (r) => {
    setReports((u) =>
      u.map((x) => (x.id === r.id ? { ...x, status: "processing" } : x)),
    );
    showToast("info", "Retrying…", `Re-generating "${r.name}".`);
    simulate(r.id, r.name);
  };

  const exportReport = (r) => {
    downloadCSV(`${r.name.replace(/\s+/g, "_")}.csv`, [
      ["Report", "Type", "Period", "Status", "Generated"],
      [r.name, r.type, r.period, r.status, r.gen],
    ]);
    showToast("success", "Downloaded!", `${r.name}.csv saved.`);
  };

  return (
    <div className="afu">
      <div className="flex items-center justify-between mb-1">
        <div className="font-syne font-black text-2xl tracking-tight">
          Reports
        </div>
        <Btn
          variant="primary"
          onClick={() => {
            setForm({ name: "", type: "Financial", period: "This Month" });
            setErr("");
            setModal(true);
          }}
        >
          ＋ Generate
        </Btn>
      </div>
      <p className="text-slate-400 text-sm mb-6">
        View and export your business reports.
      </p>

      {/* Mobile: card list; Desktop: table */}
      <Card
        title="All Reports"
        action="⬇ Export CSV"
        onAction={() => {
          downloadCSV("reports.csv", [
            ["Report", "Type", "Period", "Status", "Generated"],
            ...reports.map((r) => [r.name, r.type, r.period, r.status, r.gen]),
          ]);
          showToast("success", "Exported!", "reports.csv downloaded.");
        }}
      >
        {/* Mobile card layout */}
        <div className="sm:hidden space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="nova-s2 rounded-xl p-3.5 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[0.85rem] font-semibold nova-text mb-0.5 truncate">
                  {r.name}
                </div>
                <div className="text-[0.72rem] nova-muted">
                  {r.type} · {r.period}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Pill
                    color={
                      r.status === "ready"
                        ? "green"
                        : r.status === "processing"
                          ? "orange"
                          : "red"
                    }
                  >
                    {r.status === "ready"
                      ? "Ready"
                      : r.status === "processing"
                        ? "Processing"
                        : "Failed"}
                  </Pill>
                  {r.status === "processing" && (
                    <span className="text-[0.68rem] text-orange-400 pulse">
                      ●
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                {r.status === "ready" && (
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => exportReport(r)}
                  >
                    ⬇
                  </Btn>
                )}
                {r.status === "failed" && (
                  <Btn variant="danger" size="sm" onClick={() => retry(r)}>
                    ↺
                  </Btn>
                )}
                {r.status === "processing" && (
                  <span className="text-[0.75rem] text-slate-500">…</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block -mx-5 -mb-5 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Report", "Type", "Period", "Status", "Generated", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-[0.68rem] font-medium text-slate-400 uppercase tracking-wider px-3 py-2.5 border-b border-white/[0.07]"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="hrow">
                  <td className="px-3 py-3 text-[0.82rem] font-medium border-b border-white/[0.04]">
                    {r.name}
                  </td>
                  <td className="px-3 py-3 border-b border-white/[0.04]">
                    <Tag>{r.type}</Tag>
                  </td>
                  <td className="px-3 py-3 text-[0.82rem] text-slate-400 border-b border-white/[0.04]">
                    {r.period}
                  </td>
                  <td className="px-3 py-3 border-b border-white/[0.04]">
                    <Pill
                      color={
                        r.status === "ready"
                          ? "green"
                          : r.status === "processing"
                            ? "orange"
                            : "red"
                      }
                    >
                      {r.status === "ready"
                        ? "Ready"
                        : r.status === "processing"
                          ? "Processing"
                          : "Failed"}
                    </Pill>
                    {r.status === "processing" && (
                      <span className="ml-1 text-[0.68rem] text-orange-400 pulse">
                        ●
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[0.82rem] text-slate-400 border-b border-white/[0.04]">
                    {r.gen}
                  </td>
                  <td className="px-3 py-3 border-b border-white/[0.04]">
                    {r.status === "ready" && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => exportReport(r)}
                      >
                        ⬇ CSV
                      </Btn>
                    )}
                    {r.status === "failed" && (
                      <Btn variant="danger" size="sm" onClick={() => retry(r)}>
                        ↺ Retry
                      </Btn>
                    )}
                    {r.status === "processing" && (
                      <span className="text-[0.75rem] text-slate-500">
                        Pending…
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="＋ Generate Report"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setModal(false)}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={generate}>
              Generate
            </Btn>
          </>
        }
      >
        <Field label="Report Name" required error={err}>
          <Input
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }));
              setErr("");
            }}
            placeholder="e.g. Q2 Revenue Summary"
            hasError={!!err}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <Sel
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              {["Financial", "Growth", "Marketing", "Retention", "DevOps"].map(
                (t) => (
                  <option key={t}>{t}</option>
                ),
              )}
            </Sel>
          </Field>
          <Field label="Period">
            <Sel
              value={form.period}
              onChange={(e) =>
                setForm((f) => ({ ...f, period: e.target.value }))
              }
            >
              {["This Month", "Last Month", "Q1 2025", "Q2 2025", "Custom"].map(
                (t) => (
                  <option key={t}>{t}</option>
                ),
              )}
            </Sel>
          </Field>
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────
// PAGE: TEAM
// ─────────────────────────────────────────────
const TeamPage = ({ members, setMembers, showToast }) => {
  const [inviteModal, setInviteModal] = useState(false);
  const [viewMember, setViewMember] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({ email: "", role: "Member" });
  const [err, setErr] = useState("");

  const GRADS = [
    ["#6ee7b7", "#34d399"],
    ["#818cf8", "#a78bfa"],
    ["#fb923c", "#fbbf24"],
    ["#f87171", "#f472b6"],
    ["#34d399", "#06b6d4"],
  ];

  const invite = () => {
    if (!form.email.includes("@")) {
      setErr("Please enter a valid email.");
      return;
    }
    const parts = form.email.split("@")[0].replace(/[._-]/g, " ").split(" ");
    const name = parts
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const grad = GRADS[members.length % GRADS.length];
    const nm = {
      id: Date.now(),
      initials,
      name,
      email: form.email,
      role: form.role,
      roleTag: "orange",
      roleLabel: form.role,
      grad,
      projects: 0,
      activity: 0,
      joined: new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    };
    setMembers((u) => [...u, nm]);
    setInviteModal(false);
    setForm({ email: "", role: "Member" });
    setErr("");
    showToast("success", "Invite Sent!", `Invitation sent to ${form.email}.`);
  };

  const remove = (m) => {
    setConfirm({
      ico: "👤",
      title: "Remove Member?",
      msg: `${m.name} will lose access immediately.`,
      btn: "Remove Member",
      cb: () => {
        setMembers((u) => u.filter((x) => x.id !== m.id));
        setConfirm(null);
        setViewMember(null);
        showToast("success", "Removed!", `${m.name} removed.`);
      },
    });
  };

  return (
    <div className="afu">
      <div className="flex items-center justify-between mb-1">
        <div className="font-syne font-black text-2xl tracking-tight">Team</div>
        <Btn
          variant="primary"
          onClick={() => {
            setForm({ email: "", role: "Member" });
            setErr("");
            setInviteModal(true);
          }}
        >
          ＋ Invite
        </Btn>
      </div>
      <p className="text-slate-400 text-sm mb-6">
        {members.length} members in your workspace.
      </p>

      {/* 2-col on mobile, 3-col on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {members.map((m) => (
          <div
            key={m.id}
            onClick={() => setViewMember(m)}
            className="nova-card border rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-2 sm:gap-2.5 text-center hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,.2)] transition-all cursor-pointer"
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-lg sm:text-xl font-black text-[#0a0b0f]"
              style={{
                background: `linear-gradient(135deg,${m.grad[0]},${m.grad[1]})`,
              }}
            >
              {m.initials}
            </div>
            <div className="font-syne font-bold text-[0.85rem] sm:text-[0.9rem] leading-tight">
              {m.name}
            </div>
            <div className="text-[0.68rem] sm:text-[0.72rem] text-slate-400 leading-tight">
              {m.role}
            </div>
            <Pill color={m.roleTag}>{m.roleLabel}</Pill>
            <div className="flex gap-3 sm:gap-4 mt-0.5">
              <div>
                <div className="font-bold text-[0.85rem] sm:text-[0.9rem]">
                  {m.projects}
                </div>
                <div className="text-[0.6rem] sm:text-[0.65rem] text-slate-400">
                  Projects
                </div>
              </div>
              <div>
                <div className="font-bold text-[0.85rem] sm:text-[0.9rem]">
                  {m.activity}%
                </div>
                <div className="text-[0.6rem] sm:text-[0.65rem] text-slate-400">
                  Activity
                </div>
              </div>
            </div>
            <div
              className="flex gap-1.5 sm:gap-2 mt-0.5 flex-wrap justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Btn variant="ghost" size="sm" onClick={() => setViewMember(m)}>
                Profile
              </Btn>
              {!m.isOwner && (
                <Btn variant="danger" size="sm" onClick={() => remove(m)}>
                  Remove
                </Btn>
              )}
            </div>
          </div>
        ))}
        <div
          className="nova-border border border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:border-emerald-400/40 transition-colors min-h-[160px]"
          onClick={() => {
            setForm({ email: "", role: "Member" });
            setErr("");
            setInviteModal(true);
          }}
        >
          <div className="text-2xl sm:text-3xl text-slate-500">＋</div>
          <div className="font-semibold text-[0.82rem] sm:text-[0.85rem]">
            Invite Member
          </div>
        </div>
      </div>

      <Modal
        open={inviteModal}
        onClose={() => setInviteModal(false)}
        title="＋ Invite Member"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setInviteModal(false)}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={invite}>
              Send Invite
            </Btn>
          </>
        }
      >
        <Field label="Email Address" required error={err}>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => {
              setForm((f) => ({ ...f, email: e.target.value }));
              setErr("");
            }}
            placeholder="colleague@example.com"
            hasError={!!err}
          />
        </Field>
        <Field label="Role">
          <Sel
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          >
            <option>Member</option>
            <option>Admin</option>
            <option>Viewer</option>
          </Sel>
        </Field>
        <Field label="Personal Message (optional)">
          <Textarea placeholder="Hey! I'd like to invite you to our Nova workspace…" />
        </Field>
      </Modal>

      <Modal
        open={!!viewMember}
        onClose={() => setViewMember(null)}
        title="👤 Member Profile"
        large
        footer={
          <>
            <Btn variant="ghost" onClick={() => setViewMember(null)}>
              Close
            </Btn>
            {viewMember && !viewMember.isOwner && (
              <Btn
                variant="danger"
                size="sm"
                onClick={() => remove(viewMember)}
              >
                Remove from Workspace
              </Btn>
            )}
          </>
        }
      >
        {viewMember && (
          <>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-[#0a0b0f] flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg,${viewMember.grad[0]},${viewMember.grad[1]})`,
                }}
              >
                {viewMember.initials}
              </div>
              <div className="text-center sm:text-left">
                <div className="font-syne font-black text-lg">
                  {viewMember.name}
                </div>
                <div className="text-sm text-slate-400">{viewMember.role}</div>
                <div className="text-sm text-slate-400">{viewMember.email}</div>
                <div className="mt-1">
                  <Pill color={viewMember.roleTag}>{viewMember.roleLabel}</Pill>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                ["Projects", viewMember.projects],
                ["Activity", `${viewMember.activity}%`],
                ["Joined", viewMember.joined],
              ].map(([k, v]) => (
                <div key={k} className="nova-s2 rounded-xl p-3 text-center">
                  <div className="font-bold text-sm">{v}</div>
                  <div className="text-[0.7rem] text-slate-400">{k}</div>
                </div>
              ))}
            </div>
            <ProgBar
              label="Activity Score"
              pct={viewMember.activity}
              color={viewMember.grad[0]}
            />
          </>
        )}
      </Modal>

      <Confirm
        open={!!confirm}
        config={confirm || {}}
        onClose={() => setConfirm(null)}
        onConfirm={confirm?.cb}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// PAGE: INTEGRATIONS
// ─────────────────────────────────────────────
const IntegrationsPage = ({ showToast }) => {
  const ALL_INT = [
    { ico: "💳", name: "Stripe", desc: "Payment processing", cat: "Payments" },
    { ico: "📧", name: "Mailchimp", desc: "Email campaigns", cat: "Marketing" },
    {
      ico: "💬",
      name: "Slack",
      desc: "Team notifications",
      cat: "Communication",
    },
    {
      ico: "📊",
      name: "Google Analytics",
      desc: "Web analytics",
      cat: "Analytics",
    },
    { ico: "🗄", name: "Notion", desc: "Docs & projects", cat: "Productivity" },
    { ico: "🐙", name: "GitHub", desc: "Code repository", cat: "Dev" },
    {
      ico: "📱",
      name: "Telegram Bot",
      desc: "Bot alerts",
      cat: "Communication",
    },
    { ico: "🔷", name: "Jira", desc: "Issue tracking", cat: "Dev" },
  ];
  const [connected, setConnected] = useState(["Stripe", "Mailchimp", "Slack"]);
  const [confirm, setConfirm] = useState(null);

  const connect = (name) => {
    setConnected((u) => [...u, name]);
    showToast("success", "Connected!", `${name} is now connected.`);
  };
  const disconnect = (name) => {
    setConfirm({
      ico: "🔌",
      title: "Disconnect?",
      msg: `${name} will be disconnected. You can reconnect later.`,
      btn: "Disconnect",
      cb: () => {
        setConnected((u) => u.filter((c) => c !== name));
        showToast("info", "Disconnected", `${name} disconnected.`);
        setConfirm(null);
      },
    });
  };

  const connList = ALL_INT.filter((a) => connected.includes(a.name));
  const availList = ALL_INT.filter((a) => !connected.includes(a.name));

  const IntCard = ({ c, isConnected }) => (
    <div className="nova-card border rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 hover:-translate-y-px transition-all">
      <div className="nova-s2 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
        {c.ico}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[0.85rem] sm:text-[0.88rem]">
          {c.name}
        </div>
        <div className="text-[0.7rem] sm:text-[0.72rem] text-slate-400 truncate">
          {c.desc}
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {isConnected ? (
          <>
            <Pill color="green">
              <span className="hidden sm:inline">Connected</span>
              <span className="sm:hidden">✓</span>
            </Pill>
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => disconnect(c.name)}
              className="hidden sm:inline-flex"
            >
              Disconnect
            </Btn>
            <Btn
              variant="icon"
              size="sm"
              onClick={() => disconnect(c.name)}
              className="sm:hidden"
            >
              ✕
            </Btn>
          </>
        ) : (
          <Btn variant="primary" size="sm" onClick={() => connect(c.name)}>
            Connect
          </Btn>
        )}
      </div>
    </div>
  );

  return (
    <div className="afu">
      <div className="font-syne font-black text-2xl tracking-tight mb-1">
        Integrations
      </div>
      <p className="text-slate-400 text-sm mb-6">
        Connect your favourite tools. {connected.length}/{ALL_INT.length}{" "}
        connected.
      </p>

      {connList.length > 0 && (
        <>
          <div className="text-[0.78rem] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Connected ({connList.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {connList.map((c) => (
              <IntCard key={c.name} c={c} isConnected />
            ))}
          </div>
        </>
      )}

      {availList.length > 0 && (
        <>
          <div className="text-[0.78rem] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Available
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availList.map((a) => (
              <IntCard key={a.name} c={a} isConnected={false} />
            ))}
          </div>
        </>
      )}

      <Confirm
        open={!!confirm}
        config={confirm || {}}
        onClose={() => setConfirm(null)}
        onConfirm={confirm?.cb}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// PAGE: NOTIFICATIONS
// ─────────────────────────────────────────────
const NotificationsPage = ({
  notifs,
  onMarkNotifRead,
  onMarkAllNotifsRead,
  onDeleteNotif,
}) => {
  const unread = notifs.filter((n) => n.unread).length;
  const normalize = (n) => ({
    ...n,
    ico: n.ico || n.icon || "🔔",
    bg: n.bg || n.bgColor || "rgba(100,116,139,.1)",
    msg: n.msg || n.message || "",
    time:
      n.time || (n.createdAt ? new Date(n.createdAt).getTime() : Date.now()),
  });

  return (
    <div className="afu">
      <div className="flex items-center justify-between mb-1">
        <div className="font-syne font-black text-2xl tracking-tight">
          Notifications
        </div>
        {unread > 0 && (
          <Btn variant="ghost" size="sm" onClick={onMarkAllNotifsRead}>
            ✓ Mark all read
          </Btn>
        )}
      </div>
      <p className="text-slate-400 text-sm mb-6">
        {unread > 0
          ? `You have ${unread} unread notification${unread > 1 ? "s" : ""}.`
          : "All caught up! ✨"}
      </p>
      {notifs.length === 0 ? (
        <div className="nova-card border rounded-2xl p-10 sm:p-16 text-center">
          <div className="text-5xl mb-4">🔔</div>
          <div className="font-syne font-bold text-lg mb-2">
            No notifications
          </div>
          <p className="text-slate-400 text-sm">You're all caught up.</p>
        </div>
      ) : (
        <Card>
          {notifs.map((raw) => {
            const n = normalize(raw);
            return (
              <div
                key={n.id}
                onClick={() => onMarkNotifRead(n.id)}
                className={`flex items-start gap-3 py-3.5 nova-border border-b last:border-0 cursor-pointer hrow -mx-4 sm:-mx-5 px-4 sm:px-5 rounded-lg transition-colors ${n.unread ? "" : "opacity-60"}`}
              >
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: n.bg }}
                >
                  {n.ico}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-[0.83rem] mb-0.5 ${n.unread ? "font-semibold" : ""}`}
                  >
                    {n.title}
                  </div>
                  <div className="text-[0.72rem] text-slate-400 leading-relaxed">
                    {n.msg}
                  </div>
                  <div className="text-[0.68rem] text-slate-500 mt-1">
                    {timeAgo(n.time)}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {n.unread && (
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNotif(n.id);
                    }}
                    className="nova-muted hover:text-red-400 text-sm transition-colors tap-target flex items-center justify-center"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// PAGE: BILLING
// ─────────────────────────────────────────────
const BillingPage = ({ showToast }) => {
  const PLANS = {
    Starter: { price: "Free", features: "3 projects · 2 members" },
    Pro: {
      price: "$49/mo",
      features: "Unlimited · 10 members · Priority support",
    },
    Enterprise: {
      price: "$199/mo",
      features: "Unlimited + SSO + SLA + Custom domain",
    },
  };
  const [plan, setPlan] = useState("Pro");
  const [planModal, setPlanModal] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });
  const [cardErr, setCardErr] = useState("");

  const changePlan = (p) => {
    setPlan(p);
    setPlanModal(false);
    showToast("success", "Plan Updated!", `Switched to ${p} plan.`);
  };

  const saveCard = () => {
    const n = card.number.replace(/\s/g, "");
    if (n.length < 16) {
      setCardErr("Enter a valid 16-digit card number.");
      return;
    }
    if (!card.expiry.match(/^\d{2}\/\d{2}$/)) {
      setCardErr("Use MM/YY format.");
      return;
    }
    if (card.cvc.length < 3) {
      setCardErr("Enter 3-digit CVC.");
      return;
    }
    setCardErr("");
    setPayModal(false);
    setCard({ number: "", expiry: "", cvc: "" });
    showToast("success", "Card Saved!", "Payment method updated.");
  };

  return (
    <div className="afu">
      <div className="font-syne font-black text-2xl tracking-tight mb-1">
        Billing
      </div>
      <p className="text-slate-400 text-sm mb-6">
        Manage your subscription and invoices.
      </p>

      {/* Plan card — stacks on mobile */}
      <div className="bg-gradient-to-br from-emerald-400/[0.08] to-indigo-400/[0.06] border border-emerald-400/20 rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-block bg-emerald-400 text-[#0a0b0f] text-[0.7rem] font-bold px-2.5 py-0.5 rounded-full mb-2">
              {plan.toUpperCase()}
            </span>
            <div className="font-syne font-black text-xl">{plan} Plan</div>
            <div className="text-sm text-slate-400 mt-1">
              {PLANS[plan].features}
            </div>
          </div>
          <div className="sm:text-right">
            <div className="font-syne font-black text-3xl">
              {PLANS[plan].price}
            </div>
            <div className="text-sm text-slate-400">
              Next billing: Apr 20, 2025
            </div>
            <div className="flex gap-2 mt-3 sm:justify-end flex-wrap">
              <Btn variant="ghost" onClick={() => setPlanModal(true)}>
                Change Plan
              </Btn>
              <Btn variant="primary" onClick={() => setPayModal(true)}>
                Manage Payment
              </Btn>
            </div>
          </div>
        </div>
      </div>

      <Card
        title="Invoice History"
        action="⬇ Export All"
        onAction={() => {
          downloadCSV("invoices.csv", [
            ["Invoice", "Date", "Amount", "Status"],
            ...DEFAULT_INVOICES.map((i) => [
              i.id,
              i.date,
              `$${i.amount}.00`,
              "Paid",
            ]),
          ]);
          showToast("success", "Exported!", "invoices.csv downloaded.");
        }}
      >
        {/* Mobile cards */}
        <div className="sm:hidden space-y-2">
          {DEFAULT_INVOICES.map((inv) => (
            <div
              key={inv.id}
              className="nova-s2 rounded-xl p-3.5 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[0.83rem] font-semibold">{inv.id}</div>
                <div className="text-[0.72rem] nova-muted">
                  {inv.date} · ${inv.amount}.00
                </div>
              </div>
              <Pill color="green">Paid</Pill>
              <Btn
                variant="ghost"
                size="sm"
                onClick={() => {
                  downloadCSV(`${inv.id}.csv`, [
                    ["Invoice", "Date", "Amount", "Status"],
                    [inv.id, inv.date, `$${inv.amount}.00`, "Paid"],
                  ]);
                  showToast("success", "Downloaded!", `${inv.id}.csv saved.`);
                }}
              >
                ⬇
              </Btn>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block -mx-5 -mb-5 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Invoice", "Date", "Amount", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[0.68rem] font-medium text-slate-400 uppercase tracking-wider px-3 py-2.5 border-b border-white/[0.07]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEFAULT_INVOICES.map((inv) => (
                <tr key={inv.id} className="hrow">
                  <td className="px-3 py-3 text-[0.82rem] font-medium border-b border-white/[0.04]">
                    {inv.id}
                  </td>
                  <td className="px-3 py-3 text-[0.82rem] text-slate-400 border-b border-white/[0.04]">
                    {inv.date}
                  </td>
                  <td className="px-3 py-3 text-[0.82rem] border-b border-white/[0.04]">
                    ${inv.amount}.00
                  </td>
                  <td className="px-3 py-3 border-b border-white/[0.04]">
                    <Pill color="green">Paid</Pill>
                  </td>
                  <td className="px-3 py-3 border-b border-white/[0.04]">
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        downloadCSV(`${inv.id}.csv`, [
                          ["Invoice", "Date", "Amount", "Status"],
                          [inv.id, inv.date, `$${inv.amount}.00`, "Paid"],
                        ]);
                        showToast(
                          "success",
                          "Downloaded!",
                          `${inv.id}.csv saved.`,
                        );
                      }}
                    >
                      ⬇ PDF
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={planModal}
        onClose={() => setPlanModal(false)}
        title="Change Plan"
        large
        footer={
          <Btn variant="ghost" onClick={() => setPlanModal(false)}>
            Close
          </Btn>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(PLANS).map(([name, info]) => (
            <div
              key={name}
              onClick={name !== plan ? () => changePlan(name) : undefined}
              className={`rounded-xl p-4 sm:p-5 border-2 transition-all relative ${name === plan ? "bg-emerald-400/[0.08] border-emerald-400" : "nova-s2 border-white/[0.07] hover:border-emerald-400/40 cursor-pointer"}`}
            >
              {name === plan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-400 text-[#0a0b0f] text-[0.65rem] font-bold px-3 py-0.5 rounded-full">
                  CURRENT
                </div>
              )}
              <div className="font-syne font-black text-lg mb-1">{name}</div>
              <div className="font-syne font-bold text-2xl mb-2">
                {info.price}
              </div>
              <div className="text-[0.75rem] text-slate-400">
                {info.features}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={payModal}
        onClose={() => setPayModal(false)}
        title="💳 Manage Payment"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setPayModal(false)}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={saveCard}>
              Save Card
            </Btn>
          </>
        }
      >
        <div className="nova-s2 nova-border flex items-center gap-3 border rounded-xl p-4 mb-5">
          <span className="text-2xl">💳</span>
          <div>
            <div className="font-medium text-[0.85rem]">
              Visa ending in 4242
            </div>
            <div className="text-[0.72rem] text-slate-400">Expires 09/2026</div>
          </div>
          <Pill color="green">Default</Pill>
        </div>
        {cardErr && (
          <div className="text-[0.78rem] text-red-400 mb-3 nova-s2 px-3 py-2 rounded-lg border border-red-400/20">
            {cardErr}
          </div>
        )}
        <Field label="Card Number">
          <Input
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            value={card.number}
            onChange={(e) => {
              setCardErr("");
              setCard((c) => ({
                ...c,
                number: e.target.value
                  .replace(/[^\d]/g, "")
                  .replace(/(.{4})/g, "$1 ")
                  .trim(),
              }));
            }}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Expiry">
            <Input
              placeholder="MM/YY"
              maxLength={5}
              value={card.expiry}
              onChange={(e) => {
                setCardErr("");
                let v = e.target.value.replace(/\D/g, "");
                if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                setCard((c) => ({ ...c, expiry: v }));
              }}
            />
          </Field>
          <Field label="CVC">
            <Input
              placeholder="123"
              maxLength={3}
              value={card.cvc}
              onChange={(e) => {
                setCardErr("");
                setCard((c) => ({
                  ...c,
                  cvc: e.target.value.replace(/\D/g, ""),
                }));
              }}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────
// PAGE: SETTINGS
// ─────────────────────────────────────────────
const SettingsPage = ({
  profile,
  onUpdateProfile,
  onChangePassword,
  onDeleteAccount,
  showToast,
  confirmDelete,
  isDark,
  toggleDark,
}) => {
  const [prefs, setPrefs] = useState({
    emailNotif: true,
    twoFA: false,
    lang: "English",
  });
  const [nameModal, setNameModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name || "");
  const [emailInput, setEmailInput] = useState(profile?.email || "");
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdErr, setPwdErr] = useState("");
  const [saving, setSaving] = useState(false);

  const togglePref = (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    showToast(
      "success",
      next[key] ? "Enabled" : "Disabled",
      `${key} ${next[key] ? "enabled" : "disabled"}.`,
    );
  };

  const saveName = async () => {
    if (!nameInput.trim()) {
      showToast("error", "Error", "Name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      await onUpdateProfile({ name: nameInput, email: profile.email });
      setNameModal(false);
      showToast("success", "Saved!", "Display name updated.");
    } catch (e) {
      showToast(
        "error",
        "Error",
        e.response?.data?.message || "Failed to save.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveEmail = async () => {
    if (!emailInput.includes("@")) {
      showToast("error", "Invalid Email", "Enter a valid email.");
      return;
    }
    setSaving(true);
    try {
      await onUpdateProfile({ name: profile.name, email: emailInput });
      setEmailModal(false);
      showToast("success", "Updated!", "Email changed.");
    } catch (e) {
      showToast(
        "error",
        "Error",
        e.response?.data?.message || "Failed to update.",
      );
    } finally {
      setSaving(false);
    }
  };

  const savePwd = async () => {
    if (pwd.next.length < 8) {
      setPwdErr("Min 8 characters.");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setPwdErr("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await onChangePassword({
        currentPassword: pwd.current,
        newPassword: pwd.next,
      });
      setPwdModal(false);
      setPwd({ current: "", next: "", confirm: "" });
      setPwdErr("");
      showToast("success", "Updated!", "Password changed.");
    } catch (e) {
      setPwdErr(e.response?.data?.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  const Row = ({ name, desc, control, danger }) => (
    <div
      className={`nova-card flex items-center justify-between px-4 py-3.5 border rounded-xl mb-2 gap-3 ${danger ? "border-red-400/20" : "nova-border"}`}
    >
      <div className="flex-1 min-w-0">
        <div
          className={`text-[0.85rem] font-medium mb-0.5 ${danger ? "text-red-400" : "nova-text"}`}
        >
          {name}
        </div>
        <div className="text-[0.72rem] nova-muted">{desc}</div>
      </div>
      <div className="flex-shrink-0">{control}</div>
    </div>
  );

  return (
    <div className="afu">
      <div className="font-syne font-black text-2xl tracking-tight mb-1">
        Settings
      </div>
      <p className="text-slate-400 text-sm mb-6">
        Customize your workspace preferences.
      </p>

      <div className="mb-7">
        <div className="font-syne font-bold text-[0.8rem] text-slate-400 uppercase tracking-wider mb-3">
          Profile
        </div>
        <Row
          name="Display Name"
          desc={profile.name}
          control={
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => {
                setNameInput(profile.name);
                setNameModal(true);
              }}
            >
              Edit
            </Btn>
          }
        />
        <Row
          name="Email Address"
          desc={profile.email}
          control={
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => {
                setEmailInput(profile.email);
                setEmailModal(true);
              }}
            >
              Change
            </Btn>
          }
        />
        <Row
          name="Password"
          desc="Last changed 30 days ago"
          control={
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => {
                setPwd({ current: "", next: "", confirm: "" });
                setPwdErr("");
                setPwdModal(true);
              }}
            >
              Update
            </Btn>
          }
        />
        <Row
          name="Profile Picture"
          desc="Upload a custom avatar"
          control={
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files[0])
                    showToast(
                      "success",
                      "Uploaded!",
                      "Profile picture updated.",
                    );
                }}
              />
              <Btn variant="ghost" size="sm" onClick={() => {}}>
                Upload
              </Btn>
            </label>
          }
        />
      </div>

      <div className="mb-7">
        <div className="font-syne font-bold text-[0.8rem] text-slate-400 uppercase tracking-wider mb-3">
          Preferences
        </div>
        <Row
          name="Dark Mode"
          desc={isDark ? "Dark theme active" : "Light theme active"}
          control={<Toggle on={isDark} onChange={toggleDark} />}
        />
        <Row
          name="Email Notifications"
          desc="Receive updates via email"
          control={
            <Toggle
              on={prefs.emailNotif}
              onChange={() => togglePref("emailNotif")}
            />
          }
        />
        <Row
          name="Two-Factor Auth"
          desc="Add extra login security"
          control={
            <Toggle on={prefs.twoFA} onChange={() => togglePref("twoFA")} />
          }
        />
        <Row
          name="Language"
          desc="Interface language"
          control={
            <Sel
              value={prefs.lang}
              onChange={(e) => {
                const n = { ...prefs, lang: e.target.value };
                setPrefs(n);
                showToast("success", "Saved!", `Language: ${e.target.value}.`);
              }}
              className="w-auto text-[0.78rem]"
            >
              <option>English</option>
              <option>ភាសាខ្មែរ</option>
              <option>日本語</option>
            </Sel>
          }
        />
      </div>

      <div>
        <div className="font-syne font-bold text-[0.8rem] text-slate-400 uppercase tracking-wider mb-3">
          Danger Zone
        </div>
        <Row
          name="Delete Account"
          desc="Permanently delete your account and all data"
          danger
          control={
            <Btn
              variant="danger"
              size="sm"
              onClick={() => confirmDelete("account", onDeleteAccount)}
            >
              Delete Account
            </Btn>
          }
        />
      </div>

      <Modal
        open={nameModal}
        onClose={() => !saving && setNameModal(false)}
        title="Edit Display Name"
        footer={
          <>
            <Btn
              variant="ghost"
              onClick={() => setNameModal(false)}
              disabled={saving}
            >
              Cancel
            </Btn>
            <Btn variant="primary" onClick={saveName} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Btn>
          </>
        }
      >
        <Field label="Display Name" required>
          <Input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your display name"
          />
        </Field>
      </Modal>

      <Modal
        open={emailModal}
        onClose={() => !saving && setEmailModal(false)}
        title="Change Email"
        footer={
          <>
            <Btn
              variant="ghost"
              onClick={() => setEmailModal(false)}
              disabled={saving}
            >
              Cancel
            </Btn>
            <Btn variant="primary" onClick={saveEmail} disabled={saving}>
              {saving ? "Saving…" : "Update Email"}
            </Btn>
          </>
        }
      >
        <Field label="New Email" required>
          <Input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
        </Field>
        <Field label="Confirm Password">
          <Input type="password" placeholder="Enter your password to confirm" />
        </Field>
      </Modal>

      <Modal
        open={pwdModal}
        onClose={() => !saving && setPwdModal(false)}
        title="Change Password"
        footer={
          <>
            <Btn
              variant="ghost"
              onClick={() => setPwdModal(false)}
              disabled={saving}
            >
              Cancel
            </Btn>
            <Btn variant="primary" onClick={savePwd} disabled={saving}>
              {saving ? "Saving…" : "Update Password"}
            </Btn>
          </>
        }
      >
        <Field label="Current Password">
          <Input
            type="password"
            value={pwd.current}
            onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
            placeholder="Current password"
          />
        </Field>
        <Field label="New Password" error={pwdErr}>
          <Input
            type="password"
            value={pwd.next}
            onChange={(e) => {
              setPwd((p) => ({ ...p, next: e.target.value }));
              setPwdErr("");
            }}
            placeholder="Min 8 characters"
          />
        </Field>
        <Field label="Confirm New Password">
          <Input
            type="password"
            value={pwd.confirm}
            onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
            placeholder="Repeat new password"
          />
        </Field>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────
// PAGE: HELP
// ─────────────────────────────────────────────
const HelpPage = ({ showToast }) => {
  const [openFaq, setOpenFaq] = useState(null);
  const [supportModal, setSupportModal] = useState(false);
  const [ticket, setTicket] = useState({
    subject: "",
    priority: "High",
    message: "",
  });
  const [tErr, setTErr] = useState("");

  const submitTicket = () => {
    if (!ticket.subject.trim() || !ticket.message.trim()) {
      setTErr("Subject and message are required.");
      return;
    }
    setSupportModal(false);
    setTicket({ subject: "", priority: "High", message: "" });
    setTErr("");
    showToast(
      "success",
      "Ticket Submitted!",
      "We'll reply within 24h. Check your email.",
    );
  };

  const faqs = [
    [
      "How do I invite team members?",
      "Go to Team → click ＋ Invite Member → enter their email and select a role. They'll receive an invitation email within minutes.",
    ],
    [
      "How do I connect a new integration?",
      "Navigate to Integrations and click Connect next to the service. Follow the authorization steps.",
    ],
    [
      "Can I export my data?",
      "Yes — go to Reports and click Export CSV. You can also export individual invoices from Billing.",
    ],
    [
      "How to upgrade my plan?",
      "Visit Billing → click Change Plan to see available options and upgrade instantly.",
    ],
    [
      "How do I reset my password?",
      "Go to Settings → Profile → Password and click Update.",
    ],
    [
      "Is my data backed up?",
      "Yes, all data is saved in your browser's localStorage. Export CSVs regularly as backups.",
    ],
  ];

  return (
    <div className="afu">
      <div className="font-syne font-black text-2xl tracking-tight mb-1">
        Help & Docs
      </div>
      <p className="text-slate-400 text-sm mb-6">
        Resources to get the most out of Nova.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          [
            "📚",
            "Documentation",
            "Full API reference and guides",
            () => {
              window.open("https://github.com", "_blank");
              showToast("info", "Opening…", "Redirecting to docs.");
            },
          ],
          [
            "🎓",
            "Tutorials",
            "Step-by-step video walkthroughs",
            () => {
              window.open("https://youtube.com", "_blank");
              showToast("info", "Opening…", "Loading tutorials.");
            },
          ],
          [
            "💬",
            "Live Support",
            "Chat with our team now",
            () => setSupportModal(true),
          ],
        ].map(([ico, title, desc, fn], i) => (
          <div
            key={i}
            onClick={fn}
            className="nova-card border rounded-2xl p-5 sm:p-7 flex sm:flex-col items-center sm:text-center gap-4 sm:gap-0 cursor-pointer hover:-translate-y-0.5 transition-all"
          >
            <div className="text-3xl sm:mb-3 flex-shrink-0">{ico}</div>
            <div>
              <div className="font-syne font-bold text-[0.9rem] sm:mb-1.5 nova-text">
                {title}
              </div>
              <div className="text-[0.78rem] nova-muted">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <Card title="Frequently Asked Questions">
        {faqs.map(([q, a], i) => (
          <div
            key={i}
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="nova-s2 p-4 rounded-xl cursor-pointer mb-2 last:mb-0 hover:nova-s3 transition-colors"
          >
            <div className="flex justify-between items-start gap-2 text-[0.85rem] font-medium nova-text">
              <span>{q}</span>
              <span
                className={`nova-muted text-[0.8rem] inline-block transition-transform flex-shrink-0 mt-0.5 ${openFaq === i ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </div>
            {openFaq === i && (
              <div className="text-[0.75rem] nova-muted leading-relaxed mt-3 pt-3 nova-border border-t">
                {a}
              </div>
            )}
          </div>
        ))}
      </Card>

      <Modal
        open={supportModal}
        onClose={() => setSupportModal(false)}
        title="💬 Contact Support"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setSupportModal(false)}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={submitTicket}>
              Submit Ticket
            </Btn>
          </>
        }
      >
        {tErr && (
          <div className="text-[0.78rem] text-red-400 mb-3 nova-s2 px-3 py-2 rounded-lg border border-red-400/20">
            {tErr}
          </div>
        )}
        <Field label="Subject" required>
          <Input
            value={ticket.subject}
            onChange={(e) => {
              setTicket((t) => ({ ...t, subject: e.target.value }));
              setTErr("");
            }}
            placeholder="Brief description of your issue"
          />
        </Field>
        <Field label="Priority">
          <Sel
            value={ticket.priority}
            onChange={(e) =>
              setTicket((t) => ({ ...t, priority: e.target.value }))
            }
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </Sel>
        </Field>
        <Field label="Message" required>
          <Textarea
            rows={4}
            value={ticket.message}
            onChange={(e) => {
              setTicket((t) => ({ ...t, message: e.target.value }));
              setTErr("");
            }}
            placeholder="Describe your issue in detail…"
          />
        </Field>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────
// NAV CONFIG
// ─────────────────────────────────────────────
const NAV_ITEMS = [
  { section: "Main" },
  { id: "overview", icon: "⊞", label: "Overview" },
  { id: "analytics", icon: "◈", label: "Analytics" },
  { id: "projects", icon: "⬡", label: "Projects", dynBadge: "projects" },
  { id: "reports", icon: "📄", label: "Reports" },
  { divider: true },
  { section: "Workspace" },
  { id: "team", icon: "👥", label: "Team" },
  { id: "integrations", icon: "🔗", label: "Integrations" },
  {
    id: "notifications",
    icon: "🔔",
    label: "Notifications",
    dynBadge: "notifs",
    badgeDanger: true,
  },
  { divider: true },
  { section: "Account" },
  { id: "billing", icon: "💳", label: "Billing" },
  { id: "settings", icon: "⚙", label: "Settings" },
  { id: "help", icon: "❓", label: "Help & Docs" },
];

// Mobile bottom nav items (most important 5)
const MOBILE_NAV = [
  { id: "overview", icon: "⊞", label: "Home" },
  { id: "projects", icon: "⬡", label: "Projects", dynBadge: "projects" },
  { id: "analytics", icon: "◈", label: "Analytics" },
  {
    id: "notifications",
    icon: "🔔",
    label: "Alerts",
    dynBadge: "notifs",
    badgeDanger: true,
  },
  { id: "settings", icon: "⚙", label: "Settings" },
];

const PAGE_TITLES = {
  overview: "Overview",
  analytics: "Analytics",
  projects: "Projects",
  reports: "Reports",
  team: "Team",
  integrations: "Integrations",
  notifications: "Notifications",
  billing: "Billing",
  settings: "Settings",
  help: "Help & Docs",
};

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
export default function NovaDashboard({
  user,
  onLogout,
  projects = [],
  onCreateProject,
  onUpdateProject,
  onPatchProjectStatus,
  onDeleteProject,
  notifications = [],
  onMarkNotifRead,
  onMarkAllNotifsRead,
  onDeleteNotif,
  onUpdateProfile,
  onChangePassword,
  onDeleteAccount,
}) {
  const [page, setPage] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState({ open: false, config: {}, cb: null });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [clock, setClock] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [members, setMembers] = useState([
    {
      id: 1,
      initials: "TS",
      name: user?.name || "Thy Seavmeng",
      email: user?.email || "seavmeng@nova.io",
      role: "Product Manager",
      roleTag: "green",
      roleLabel: "Owner",
      grad: ["#6ee7b7", "#818cf8"],
      projects: 12,
      activity: 98,
      isOwner: true,
      joined: "Jan 2024",
    },
    {
      id: 2,
      initials: "KR",
      name: "Kimrong Rith",
      email: "kimrong@nova.io",
      role: "Frontend Developer",
      roleTag: "purple",
      roleLabel: "Admin",
      grad: ["#818cf8", "#a78bfa"],
      projects: 8,
      activity: 91,
      joined: "Feb 2024",
    },
    {
      id: 3,
      initials: "PM",
      name: "Pisach Men",
      email: "pisach@nova.io",
      role: "UI/UX Designer",
      roleTag: "orange",
      roleLabel: "Member",
      grad: ["#fb923c", "#fbbf24"],
      projects: 5,
      activity: 85,
      joined: "Mar 2024",
    },
  ]);

  const profile = { name: user?.name || "User", email: user?.email || "" };
  const unread = notifications.filter((n) => n.unread).length;

  // Inject CSS
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);
  // Clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  // ⌘K shortcut
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchQ("");
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);
  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [page]);

  const showToast = (type, title, msg, dur) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, type, title, msg, dur }]);
  };
  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));
  const toggleDark = () =>
    setIsDark((d) => {
      const n = !d;
      showToast(
        "info",
        n ? "Dark Mode" : "Light Mode",
        n ? "Switched to dark." : "Switched to light.",
      );
      return n;
    });

  const confirmDelete = (type, cb) =>
    setConfirm({
      open: true,
      config: {
        ico: "⚠️",
        title: "Delete Account?",
        msg: "All data will be permanently deleted. This cannot be undone.",
        btn: "Delete Forever",
      },
      cb: async () => {
        try {
          if (cb) await cb();
        } catch (e) {
          showToast("error", "Error", "Failed to delete account.");
        }
        setConfirm((c) => ({ ...c, open: false }));
      },
    });

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const SEARCH_BASE = [
    {
      icon: "⊞",
      label: "Overview",
      type: "Page",
      page: "overview",
      bg: "rgba(110,231,183,.1)",
    },
    {
      icon: "◈",
      label: "Analytics",
      type: "Page",
      page: "analytics",
      bg: "rgba(129,140,248,.1)",
    },
    {
      icon: "⬡",
      label: "Projects",
      type: "Page",
      page: "projects",
      bg: "rgba(251,146,60,.1)",
    },
    {
      icon: "📄",
      label: "Reports",
      type: "Page",
      page: "reports",
      bg: "rgba(100,116,139,.1)",
    },
    {
      icon: "👥",
      label: "Team",
      type: "Page",
      page: "team",
      bg: "rgba(110,231,183,.1)",
    },
    {
      icon: "🔗",
      label: "Integrations",
      type: "Page",
      page: "integrations",
      bg: "rgba(129,140,248,.1)",
    },
    {
      icon: "💳",
      label: "Billing",
      type: "Page",
      page: "billing",
      bg: "rgba(251,146,60,.1)",
    },
    {
      icon: "⚙",
      label: "Settings",
      type: "Page",
      page: "settings",
      bg: "rgba(100,116,139,.1)",
    },
    {
      icon: "❓",
      label: "Help & Docs",
      type: "Page",
      page: "help",
      bg: "rgba(110,231,183,.1)",
    },
    ...projects.map((p) => ({
      icon: "⬡",
      label: p.title,
      type: "Project",
      page: "projects",
      bg: "rgba(110,231,183,.1)",
    })),
    ...members.map((m) => ({
      icon: "👤",
      label: m.name,
      type: "Member",
      page: "team",
      bg: "rgba(129,140,248,.1)",
    })),
  ];
  const filteredSearch = searchQ
    ? SEARCH_BASE.filter((i) =>
        i.label.toLowerCase().includes(searchQ.toLowerCase()),
      )
    : SEARCH_BASE.slice(0, 8);

  const getBadge = (item) => {
    if (item.dynBadge === "notifs") return unread > 0 ? unread : null;
    if (item.dynBadge === "projects")
      return (
        projects.filter((p) => p.status?.toLowerCase() === "active").length ||
        null
      );
    return null;
  };

  const PAGES = {
    overview: (
      <OverviewPage
        projects={projects}
        members={members}
        notifs={notifications}
        navigate={setPage}
      />
    ),
    analytics: <AnalyticsPage showToast={showToast} />,
    projects: (
      <ProjectsPage
        projects={projects}
        onCreateProject={onCreateProject}
        onUpdateProject={onUpdateProject}
        onPatchProjectStatus={onPatchProjectStatus}
        onDeleteProject={onDeleteProject}
        showToast={showToast}
      />
    ),
    reports: <ReportsPage showToast={showToast} />,
    team: (
      <TeamPage
        members={members}
        setMembers={setMembers}
        showToast={showToast}
      />
    ),
    integrations: <IntegrationsPage showToast={showToast} />,
    notifications: (
      <NotificationsPage
        notifs={notifications}
        onMarkNotifRead={onMarkNotifRead}
        onMarkAllNotifsRead={onMarkAllNotifsRead}
        onDeleteNotif={onDeleteNotif}
      />
    ),
    billing: <BillingPage showToast={showToast} />,
    settings: (
      <SettingsPage
        profile={profile}
        onUpdateProfile={async (data) => {
          await onUpdateProfile(data);
          showToast("success", "Saved!", "Profile updated.");
        }}
        onChangePassword={onChangePassword}
        onDeleteAccount={onDeleteAccount}
        showToast={showToast}
        confirmDelete={confirmDelete}
        isDark={isDark}
        toggleDark={toggleDark}
      />
    ),
    help: <HelpPage showToast={showToast} />,
  };

  return (
    <div
      className={`nova-root font-dm overflow-hidden ${isDark ? "" : "light"}`}
      style={{ height: "100dvh", display: "flex", flexDirection: "column" }}
    >
      {/* ── TOPBAR (mobile + desktop) ── */}
      <header className="nova-topbar flex-shrink-0 flex items-center justify-between px-4 sm:px-7 h-[56px] sm:h-[60px] border-b backdrop-blur-xl z-30">
        {/* Left: hamburger (mobile) + title */}
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileMenuOpen((m) => !m)}
            className="md:hidden nova-s2 nova-border w-9 h-9 border rounded-[9px] flex items-center justify-center nova-muted hover:nova-text transition-all flex-shrink-0"
          >
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <rect width="16" height="2" rx="1" />
              <rect y="5" width="16" height="2" rx="1" />
              <rect y="10" width="16" height="2" rx="1" />
            </svg>
          </button>

          {/* Logo mark */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,#6ee7b7,#818cf8)",
                boxShadow: "0 0 12px rgba(110,231,183,.2)",
              }}
            >
              ✦
            </div>
            <span className="font-syne font-black text-[1.05rem] tracking-tight hidden sm:block">
              Nova
            </span>
          </div>

          {/* Page title on mobile */}
          <div className="font-syne font-bold text-[0.95rem] md:hidden">
            {PAGE_TITLES[page]}
          </div>
          {/* Page title on desktop (inside topbar for collapsed sidebar) */}
          <div className="font-syne font-bold text-[1.05rem] hidden md:block">
            {PAGE_TITLES[page]}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Clock — desktop only */}
          <div className="text-[0.78rem] nova-muted font-dm tabular-nums hidden lg:block">
            {clock.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          {/* Search */}
          <button
            onClick={() => {
              setSearchQ("");
              setSearchOpen(true);
            }}
            className="nova-s2 nova-border flex items-center gap-2 border rounded-[9px] px-2.5 sm:px-3 py-2 text-[0.8rem] nova-muted cursor-pointer hover:nova-text transition-all"
          >
            <span>⌕</span>
            <span className="hidden sm:inline text-[0.8rem]">Search…</span>
            <span className="nova-sidebar border nova-border rounded px-1 py-0.5 text-[0.65rem] hidden sm:inline">
              ⌘K
            </span>
          </button>
          {/* Theme toggle */}
          <button
            onClick={toggleDark}
            className="nova-s2 nova-border w-9 h-9 border rounded-[9px] flex items-center justify-center nova-muted hover:nova-text transition-all"
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? "🌙" : "☀️"}
          </button>
          {/* Bell */}
          <button
            onClick={() => setPage("notifications")}
            className="relative nova-s2 nova-border w-9 h-9 border rounded-[9px] flex items-center justify-center nova-muted hover:nova-text transition-all"
          >
            🔔
            {unread > 0 && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 border-2 border-[#0a0b0f]" />
            )}
          </button>
          {/* Avatar */}
          <div
            onClick={() => setPage("settings")}
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[0.75rem] text-[#0a0b0f] cursor-pointer hover:opacity-80 transition-opacity"
            style={{ background: "linear-gradient(135deg,#6ee7b7,#818cf8)" }}
          >
            {initials}
          </div>
        </div>
      </header>

      {/* ── BODY: sidebar + content ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ── DESKTOP SIDEBAR ── */}
        <aside
          className={`nova-sidebar hidden md:flex flex-col flex-shrink-0 h-full relative z-20 transition-[width] duration-300 overflow-hidden border-r ${collapsed ? "w-16" : "w-[240px] xl:w-[250px]"}`}
        >
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="nova-s2 nova-border absolute top-5 -right-3 w-6 h-6 rounded-full border flex items-center justify-center text-[0.7rem] nova-muted hover:bg-emerald-400 hover:text-[#0a0b0f] hover:border-emerald-400 transition-all z-10"
          >
            {collapsed ? "▶" : "◀"}
          </button>

          {/* Logo (sidebar) */}
          <div className="flex items-center gap-2.5 px-4 py-4 nova-border border-b flex-shrink-0">
            <div
              className="w-8 h-8 rounded-[9px] flex items-center justify-center text-base flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,#6ee7b7,#818cf8)",
                boxShadow: "0 0 14px rgba(110,231,183,.25)",
              }}
            >
              ✦
            </div>
            {!collapsed && (
              <span className="font-syne font-black text-[1.2rem] tracking-tight">
                Nova
              </span>
            )}
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3 scrollbar-thin space-y-0.5">
            {NAV_ITEMS.map((item, i) => {
              if (item.section)
                return collapsed ? null : (
                  <div
                    key={i}
                    className="text-[0.62rem] font-semibold tracking-widest nova-muted uppercase px-2.5 pt-2.5 pb-1"
                  >
                    {item.section}
                  </div>
                );
              if (item.divider)
                return (
                  <div key={i} className="h-px nova-border border-b my-2" />
                );
              const active = page === item.id;
              const badge = getBadge(item);
              return (
                <div
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`relative flex items-center ${collapsed ? "justify-center" : ""} gap-2.5 px-2.5 py-2.5 rounded-[10px] cursor-pointer transition-all group ${active ? "bg-emerald-400/10 text-emerald-400 font-medium" : "nova-muted hover:nova-s2 hover:nova-text"}`}
                >
                  {active && (
                    <div
                      className="absolute left-0 top-[22%] bottom-[22%] w-[3px] rounded-r-full bg-emerald-400"
                      style={{ boxShadow: "0 0 8px #6ee7b7" }}
                    />
                  )}
                  <div className="w-5 h-5 flex items-center justify-center text-base flex-shrink-0">
                    {item.icon}
                  </div>
                  {!collapsed && (
                    <span className="text-[0.85rem] flex-1">{item.label}</span>
                  )}
                  {!collapsed && badge > 0 && (
                    <span
                      className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full text-[#0a0b0f] ${item.badgeDanger ? "bg-red-400" : "bg-emerald-400"}`}
                    >
                      {badge}
                    </span>
                  )}
                  {collapsed && (
                    <div className="nova-sidebar nova-border absolute left-14 border text-[0.78rem] px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg nova-text">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* User footer */}
          <div className="p-2.5 nova-border border-t flex-shrink-0">
            <div
              onClick={() => setPage("settings")}
              className="nova-s2 flex items-center gap-2.5 px-2.5 py-2.5 rounded-[10px] cursor-pointer hover:nova-s3 transition-colors overflow-hidden"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[0.75rem] text-[#0a0b0f] flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#6ee7b7,#818cf8)",
                }}
              >
                {initials}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-[0.8rem] font-medium truncate">
                    {profile.name}
                  </div>
                  <div className="text-[0.68rem] text-slate-400">
                    {user?.role || "Member"}
                  </div>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  className="nova-muted hover:text-red-400 text-sm transition-colors flex-shrink-0"
                  title="Logout"
                >
                  ⏻
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ── MOBILE DRAWER OVERLAY ── */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 aOI"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <aside
              className="absolute left-0 top-0 bottom-0 w-[280px] nova-sidebar flex flex-col z-50 aSU shadow-2xl border-r nova-border"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 nova-border border-b flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-[9px] flex items-center justify-center text-base"
                    style={{
                      background: "linear-gradient(135deg,#6ee7b7,#818cf8)",
                    }}
                  >
                    ✦
                  </div>
                  <span className="font-syne font-black text-[1.2rem] tracking-tight">
                    Nova
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="nova-s2 nova-border w-8 h-8 border rounded-lg flex items-center justify-center nova-muted"
                >
                  ✕
                </button>
              </div>

              {/* Nav items */}
              <div className="flex-1 overflow-y-auto px-2.5 py-3 scrollbar-thin space-y-0.5">
                {NAV_ITEMS.map((item, i) => {
                  if (item.section)
                    return (
                      <div
                        key={i}
                        className="text-[0.62rem] font-semibold tracking-widest nova-muted uppercase px-2.5 pt-2.5 pb-1"
                      >
                        {item.section}
                      </div>
                    );
                  if (item.divider)
                    return (
                      <div key={i} className="h-px nova-border border-b my-2" />
                    );
                  const active = page === item.id;
                  const badge = getBadge(item);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setPage(item.id)}
                      className={`relative flex items-center gap-2.5 px-2.5 py-3 rounded-[10px] cursor-pointer transition-all ${active ? "bg-emerald-400/10 text-emerald-400 font-medium" : "nova-muted hover:nova-s2 hover:nova-text"}`}
                    >
                      {active && (
                        <div className="absolute left-0 top-[22%] bottom-[22%] w-[3px] rounded-r-full bg-emerald-400" />
                      )}
                      <div className="w-5 h-5 flex items-center justify-center text-base flex-shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-[0.88rem] flex-1">
                        {item.label}
                      </span>
                      {badge > 0 && (
                        <span
                          className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full text-[#0a0b0f] ${item.badgeDanger ? "bg-red-400" : "bg-emerald-400"}`}
                        >
                          {badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Drawer user footer */}
              <div className="p-3 nova-border border-t flex-shrink-0 mobile-nav-safe">
                <div className="nova-s2 flex items-center gap-2.5 px-3 py-3 rounded-[10px]">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[0.75rem] text-[#0a0b0f] flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#6ee7b7,#818cf8)",
                    }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.8rem] font-medium truncate">
                      {profile.name}
                    </div>
                    <div className="text-[0.68rem] text-slate-400">
                      {user?.role || "Member"}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                    }}
                    className="nova-muted hover:text-red-400 text-sm transition-colors"
                    title="Logout"
                  >
                    ⏻
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Scrollable page content */}
          <div
            className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 lg:px-7 py-5 sm:py-7
            pb-[calc(1.75rem+64px)] md:pb-7"
          >
            {PAGES[page]}
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 nova-topbar border-t nova-border mobile-nav-safe">
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {MOBILE_NAV.map((item) => {
            const active = page === item.id;
            const badge = getBadge(item);
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[52px] tap-target ${active ? "text-emerald-400" : "nova-muted"}`}
              >
                {badge > 0 && (
                  <div
                    className={`absolute top-1 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-[#0a0b0f] ${item.badgeDanger ? "bg-red-400" : "bg-emerald-400"}`}
                  >
                    {badge}
                  </div>
                )}
                <span className="text-xl">{item.icon}</span>
                <span
                  className={`text-[0.6rem] font-medium ${active ? "text-emerald-400" : "nova-muted"}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── TOASTS ── */}
      <div className="fixed bottom-[80px] md:bottom-6 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>

      {/* ── GLOBAL CONFIRM ── */}
      <Confirm
        open={confirm.open}
        config={confirm.config}
        onClose={() => setConfirm((c) => ({ ...c, open: false }))}
        onConfirm={confirm.cb}
      />

      {/* ── SEARCH PALETTE ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 aOI"
          onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
        >
          <div className="nova-card border rounded-2xl w-full max-w-[560px] overflow-hidden aMI shadow-[0_24px_60px_rgba(0,0,0,.4)]">
            <div className="flex items-center gap-3 px-4 sm:px-5 py-4 nova-border border-b">
              <span className="nova-muted text-xl">⌕</span>
              <input
                autoFocus
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search pages, projects, team members…"
                className="flex-1 bg-transparent nova-text text-[0.9rem] sm:text-[0.95rem] outline-none font-dm placeholder:text-slate-400"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-[0.72rem] nova-muted nova-s2 px-2 py-1 rounded nova-border border"
              >
                ESC
              </button>
            </div>
            <div className="p-2 max-h-72 sm:max-h-80 overflow-y-auto scrollbar-thin">
              {filteredSearch.length ? (
                filteredSearch.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setSearchOpen(false);
                      setPage(item.page);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer hover:nova-s2 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: item.bg }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[0.83rem] font-medium nova-text">
                        {item.label}
                      </div>
                      <div className="text-[0.7rem] nova-muted">
                        {item.type}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center nova-muted text-[0.83rem]">
                  No results for "{searchQ}"
                </div>
              )}
            </div>
            <div className="px-4 py-3 nova-border border-t flex gap-4 text-[0.72rem] nova-muted">
              <span className="hidden sm:inline">↑↓ Navigate</span>
              <span className="hidden sm:inline">↵ Select</span>
              <span>ESC Close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
