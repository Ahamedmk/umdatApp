// /src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, RotateCcw, Brain, Scale, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getDueCount } from "@/lib/hadithProgress";
import { useTheme } from "@/hooks/useTheme";

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dueCount, setDueCount]     = useState(null);
  const [loadingDue, setLoadingDue] = useState(true);
  const { isDark } = useTheme();

  /* notification permission */
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      const t = setTimeout(() => Notification.requestPermission(), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  function shouldNotifyThisMorning() {
    const now = new Date();
    const h = now.getHours();
    if (h < 7 || h > 9) return false;
    const today = now.toISOString().slice(0, 10);
    return localStorage.getItem("morning_notif_sent") !== today;
  }

  /* load due count */
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user?.id) { if (mounted) { setDueCount(0); setLoadingDue(false); } return; }
      try {
        setLoadingDue(true);
        const count = await getDueCount(user.id);
        if (!mounted) return;
        const safe = count ?? 0;
        setDueCount(safe);
        const now = new Date();
        const todayLocal = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
        if (safe > 0 && "Notification" in window && Notification.permission === "granted" && shouldNotifyThisMorning()) {
          new Notification("📘 Révisions du jour", {
            body: `Tu as ${safe} hadith${safe > 1 ? "s" : ""} à réviser aujourd'hui.`,
            icon: "/pwa-192x192.png",
          });
          localStorage.setItem("morning_notif_sent", todayLocal);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setDueCount(0);
      } finally {
        if (mounted) setLoadingDue(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user?.id]);

  const features = [
    { icon: BookOpen, title: "Apprendre",  desc: "Texte arabe, audio et opinions détaillées des savants", href: "/learn",   accent: isDark ? "#4a9f82" : "#2d8c6a" },
    { icon: RotateCcw, title: "Réviser",   desc: "Système de révision espacée intelligent (SM-2)",        href: "/review",  accent: isDark ? "#4a9fc8" : "#2a7ab0" },
    { icon: Brain,     title: "Quiz",      desc: "Teste et renforce ta compréhension des hadiths",         href: "/quiz",    accent: isDark ? "#9f7ae0" : "#7c56c8" },
    { icon: Scale,     title: "Comparer",  desc: "Analyse comparative des quatre écoles juridiques",       href: "/compare", accent: isDark ? "#c9a84c" : "#a07d28" },
  ];

  return (
    <>
      <HomeStyles isDark={isDark} />
      <div className={`hm-root ${isDark ? "hm-dark" : "hm-light"}`}>


        {/* ── Due today banner ── */}
        {!loadingDue && (
          <div className={`hm-due-banner ${dueCount > 0 ? "hm-due-banner--active" : "hm-due-banner--done"}`}>
            <div className="hm-due-inner">
              {dueCount > 0 ? (
                <>
                  <div className="hm-due-left">
                    <span className="hm-due-icon-wrap"><RotateCcw size={16} /></span>
                    <div>
                      <p className="hm-due-label">Révisions du jour</p>
                      <p className="hm-due-count">
                        <strong>{dueCount}</strong> hadith{dueCount > 1 ? "s" : ""} à réviser aujourd'hui
                      </p>
                    </div>
                  </div>
                  <button className="hm-due-cta" onClick={() => navigate("/review")}>
                    Commencer <span aria-hidden="true">→</span>
                  </button>
                </>
              ) : (
                <>
                  <span className="hm-due-icon-wrap hm-due-icon-wrap--done"><CheckCircle2 size={16} /></span>
                  <div>
                    <p className="hm-due-label">Révisions terminées ✅</p>
                    <p className="hm-due-count">Reviens demain in châ Allah</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Hero ── */}
        <header className="hm-hero">
          <div className="hm-hero-ar" aria-hidden="true">عمدة الأحكام</div>
          <h1 className="hm-hero-title">Umdat al-Ahkam</h1>
          <p className="hm-hero-sub">
            Apprends et mémorise les hadiths en arabe et en français,<br className="hm-hero-br" />
            compare les quatre écoles et progresse par répétition espacée.
          </p>
        </header>

        {/* ── Features grid ── */}
        <div className="hm-features">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <button
                key={i}
                className="hm-feature-card"
                style={{ "--accent": f.accent, "--delay": `${i * 70}ms` }}
                onClick={() => navigate(f.href)}
              >
                <div className="hm-feature-icon"><Icon size={20} /></div>
                <div className="hm-feature-body">
                  <h3 className="hm-feature-title">{f.title}</h3>
                  <p className="hm-feature-desc">{f.desc}</p>
                </div>
                <span className="hm-feature-arrow" aria-hidden="true">→</span>
              </button>
            );
          })}
        </div>

        {/* ── Stats ── */}
        <div className="hm-stats">
          {[
            { value: "500+", label: "Hadiths",  accent: isDark ? "#4a9f82" : "#2d8c6a" },
            { value: "4",    label: "Écoles",   accent: isDark ? "#c9a84c" : "#a07d28" },
            { value: "100%", label: "Gratuit",  accent: isDark ? "#9f7ae0" : "#7c56c8" },
          ].map(s => (
            <div key={s.label} className="hm-stat" style={{ "--accent": s.accent }}>
              <span className="hm-stat-value">{s.value}</span>
              <span className="hm-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Footer ornament ── */}
        <p className="hm-footer-ornament" aria-hidden="true">﷽</p>

      </div>
    </>
  );
}

function HomeStyles({ isDark }) {
  const dark = `
    .hm-dark {
      --bg:       #0d1117;
      --surface:  #161c24;
      --surface2: #1e2630;
      --border:   rgba(255,255,255,.07);
      --border2:  rgba(255,255,255,.13);
      --fg:       #e8e0d0;
      --muted:    #7a8694;
      --gold:     #c9a84c;
      --gold-dim: rgba(201,168,76,.13);
    }
    .hm-dark .hm-theme-toggle {
      background: rgba(255,255,255,.07);
      color: #c9a84c;
      border-color: rgba(201,168,76,.2);
    }
    .hm-dark .hm-theme-toggle:hover {
      background: rgba(201,168,76,.12);
    }
    .hm-dark .hm-due-banner--active {
      background: linear-gradient(135deg, rgba(74,159,200,.15), rgba(74,100,200,.1));
      border-color: rgba(74,159,200,.3);
    }
    .hm-dark .hm-due-banner--done {
      background: linear-gradient(135deg, rgba(74,159,130,.12), rgba(45,122,98,.08));
      border-color: rgba(74,159,130,.25);
    }
    .hm-dark .hm-due-icon-wrap { background: rgba(74,159,200,.2); color: #4a9fc8; }
    .hm-dark .hm-due-icon-wrap--done { background: rgba(74,159,130,.2); color: #4a9f82; }
    .hm-dark .hm-due-cta { background: #4a9fc8; color: #0d1117; }
    .hm-dark .hm-hero-ar { color: #c9a84c; }
    .hm-dark .hm-feature-card { background: #161c24; border-color: rgba(255,255,255,.07); }
    .hm-dark .hm-stat { background: #161c24; border-color: rgba(255,255,255,.07); }
    .hm-dark .hm-footer-ornament { color: #c9a84c; }
  `;

  const light = `
    .hm-light {
      --bg:       #fdf8f0;
      --surface:  #ffffff;
      --surface2: #fef6e4;
      --border:   rgba(160,125,40,.13);
      --border2:  rgba(160,125,40,.22);
      --fg:       #2c2416;
      --muted:    #7a6d58;
      --gold:     #a07d28;
      --gold-dim: rgba(160,125,40,.1);
    }
    .hm-light .hm-theme-toggle {
      background: rgba(160,125,40,.08);
      color: #7c56c8;
      border-color: rgba(124,86,200,.2);
    }
    .hm-light .hm-theme-toggle:hover {
      background: rgba(124,86,200,.1);
    }
    .hm-light .hm-due-banner--active {
      background: linear-gradient(135deg, rgba(42,122,176,.1), rgba(42,90,170,.07));
      border-color: rgba(42,122,176,.28);
    }
    .hm-light .hm-due-banner--done {
      background: linear-gradient(135deg, rgba(45,140,106,.1), rgba(30,100,78,.07));
      border-color: rgba(45,140,106,.28);
    }
    .hm-light .hm-due-icon-wrap { background: rgba(42,122,176,.13); color: #2a7ab0; }
    .hm-light .hm-due-icon-wrap--done { background: rgba(45,140,106,.15); color: #2d8c6a; }
    .hm-light .hm-due-cta { background: #2a7ab0; color: #ffffff; }
    .hm-light .hm-hero-ar { color: #a07d28; }
    .hm-light .hm-hero-title { color: #1e1810; }
    .hm-light .hm-hero-sub { color: #7a6d58; }
    .hm-light .hm-feature-card {
      background: #ffffff;
      border-color: rgba(160,125,40,.13);
      box-shadow: 0 1px 6px rgba(160,125,40,.08);
    }
    .hm-light .hm-feature-card:hover {
      box-shadow: 0 8px 28px rgba(160,125,40,.14);
    }
    .hm-light .hm-feature-title { color: #1e1810; }
    .hm-light .hm-feature-desc { color: #7a6d58; }
    .hm-light .hm-stat {
      background: #ffffff;
      border-color: rgba(160,125,40,.13);
      box-shadow: 0 1px 6px rgba(160,125,40,.07);
    }
    .hm-light .hm-stat:hover { box-shadow: 0 4px 18px rgba(160,125,40,.13); }
    .hm-light .hm-stat-label { color: #7a6d58; }
    .hm-light .hm-due-count { color: #2c2416; }
    .hm-light .hm-due-count strong { color: #1e1810; }
    .hm-light .hm-due-label { color: #7a6d58; }
    .hm-light .hm-footer-ornament { color: #a07d28; }
  `;

  return (
    <style>{`
      .hm-root {
        --serif: Georgia, 'Times New Roman', serif;
        font-family: var(--serif);
        background: var(--bg);
        color: var(--fg);
        min-height: 100vh;
        max-width: 780px;
        margin: 0 auto;
        padding: 1.2rem 1rem 5rem;
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
        transition: background .3s ease, color .3s ease;
      }

      /* ── topbar ── */
      .hm-topbar {
        display: flex;
        justify-content: flex-end;
      }
      .hm-theme-toggle {
        display: flex;
        align-items: center;
        gap: .45rem;
        border: 1px solid transparent;
        border-radius: 20px;
        padding: .38rem .85rem;
        font-size: .78rem;
        font-family: var(--serif);
        font-weight: 600;
        cursor: pointer;
        transition: background .2s, color .2s, transform .15s;
        letter-spacing: .02em;
      }
      .hm-theme-toggle:hover { transform: translateY(-1px); }

      /* ── due banner ── */
      .hm-due-banner {
        border-radius: 14px;
        padding: 1rem 1.2rem;
        border: 1px solid transparent;
        animation: fadeDown .4s ease both;
        transition: background .3s, border-color .3s;
      }
      .hm-due-inner {
        display: flex; align-items: center;
        justify-content: space-between; gap: 1rem; flex-wrap: wrap;
      }
      .hm-due-left { display: flex; align-items: center; gap: .75rem; }
      .hm-due-icon-wrap {
        width: 34px; height: 34px; flex-shrink: 0;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        transition: background .3s, color .3s;
      }
      .hm-due-label { font-size: .7rem; text-transform: uppercase; letter-spacing: .07em; margin-bottom: .15rem; color: var(--muted); }
      .hm-due-count { font-size: .9rem; color: var(--fg); }
      .hm-due-cta {
        border: none; border-radius: 9px;
        padding: .5rem 1.1rem;
        font-size: .83rem; font-weight: 700; font-family: var(--serif);
        cursor: pointer; flex-shrink: 0;
        transition: opacity .15s, transform .15s, background .3s;
      }
      .hm-due-cta:hover { opacity: .88; transform: translateY(-1px); }

      /* ── hero ── */
      .hm-hero {
        text-align: center;
        padding: 1.2rem 0 .4rem;
        animation: fadeUp .5s ease both;
      }
      .hm-hero-ar {
        font-size: 1.6rem;
        opacity: .5;
        margin-bottom: .6rem;
        letter-spacing: .04em;
        font-weight: 400;
        transition: color .3s;
      }
      .hm-hero-title {
        font-size: clamp(2rem, 5vw, 3rem);
        font-weight: 700;
        letter-spacing: -.02em;
        color: var(--fg);
        margin: 0 0 .9rem;
        line-height: 1.05;
        transition: color .3s;
      }
      .hm-hero-sub {
        font-size: .95rem;
        color: var(--muted);
        line-height: 1.7;
        max-width: 520px;
        margin: 0 auto;
        font-style: italic;
        transition: color .3s;
      }
      .hm-hero-br { display: none; }
      @media (min-width: 480px) { .hm-hero-br { display: block; } }

      /* ── features ── */
      .hm-features {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: .85rem;
      }
      @media (max-width: 480px) { .hm-features { grid-template-columns: 1fr; } }

      .hm-feature-card {
        border: 1px solid var(--border);
        border-left: 3px solid var(--accent);
        border-radius: 14px;
        padding: 1.15rem 1.1rem;
        text-align: left;
        cursor: pointer;
        display: flex;
        align-items: flex-start;
        gap: .9rem;
        transition: border-color .18s, transform .18s, box-shadow .18s, background .3s;
        animation: fadeUp .45s ease both;
        animation-delay: var(--delay, 0ms);
        position: relative;
        overflow: hidden;
      }
      .hm-feature-card::after {
        content: '';
        position: absolute; inset: 0;
        background: color-mix(in srgb, var(--accent) 6%, transparent);
        opacity: 0;
        transition: opacity .2s;
        pointer-events: none;
      }
      .hm-feature-card:hover { transform: translateY(-3px); border-color: var(--accent); }
      .hm-feature-card:hover::after { opacity: 1; }

      .hm-feature-icon {
        width: 40px; height: 40px; flex-shrink: 0;
        background: color-mix(in srgb, var(--accent) 18%, transparent);
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        color: var(--accent);
        margin-top: .1rem;
        transition: background .3s;
      }
      .hm-feature-body { flex: 1; min-width: 0; }
      .hm-feature-title {
        font-size: 1rem; font-weight: 700;
        color: var(--fg); margin: 0 0 .3rem;
        transition: color .3s;
      }
      .hm-feature-desc {
        font-size: .78rem; color: var(--muted);
        line-height: 1.5; margin: 0;
        font-style: italic;
        transition: color .3s;
      }
      .hm-feature-arrow {
        font-size: .9rem; color: var(--accent);
        opacity: 0; margin-top: .3rem; flex-shrink: 0;
        transition: opacity .2s, transform .2s;
      }
      .hm-feature-card:hover .hm-feature-arrow { opacity: 1; transform: translateX(3px); }

      /* ── stats ── */
      .hm-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: .85rem;
      }
      .hm-stat {
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 1.2rem;
        text-align: center;
        transition: border-color .18s, background .3s, box-shadow .2s;
        animation: fadeUp .5s ease both;
      }
      .hm-stat-value {
        display: block;
        font-size: 1.8rem; font-weight: 700;
        color: var(--accent);
        line-height: 1;
        margin-bottom: .3rem;
      }
      .hm-stat-label {
        display: block;
        font-size: .72rem; color: var(--muted);
        letter-spacing: .05em; text-transform: uppercase;
        transition: color .3s;
      }

      /* ── footer ornament ── */
      .hm-footer-ornament {
        text-align: center;
        font-size: 1.3rem;
        opacity: .18;
        margin: 0;
        user-select: none;
        transition: color .3s;
      }

      /* ── animations ── */
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeDown {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      ${dark}
      ${light}
    `}</style>
  );
}

export default Home;


