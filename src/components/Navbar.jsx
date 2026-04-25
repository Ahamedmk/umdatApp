// /src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ALL_HADITHS } from "../data/allHadiths";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetTrigger, SheetContent,
} from "@/components/ui/sheet";

import {
  BookOpen, Brain, RotateCcw, Scale3d, User2, Menu, Search,
  Moon, Sun, LogOut, UserCircle, Sparkles, BarChart3, History,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";

const NAV_LINKS = [
  { to: "/learn",     label: "Apprendre",  icon: BookOpen,  accent: "#4a9f82" },
  { to: "/review",    label: "Réviser",    icon: RotateCcw, accent: "#4a9fc8" },
  { to: "/progress",  label: "Progression",icon: BarChart3, accent: "#9f7ae0" },
  { to: "/quiz",      label: "Quiz",       icon: Brain,     accent: "#c96aaa" },
  { to: "/compare",   label: "Comparer",   icon: Scale3d,   accent: "#c9a84c" },
  { to: "/history",   label: "Historique", icon: History,   accent: "#7a8694" },
  { to: "/narrators", label: "Rapporteurs",icon: Sparkles,  accent: "#e07ac8" },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const totalHadiths = ALL_HADITHS.length;

  const [open, setOpen] = useState(false);
  const [goto, setGoto] = useState("");
  const { isDark: dark, setTheme } = useTheme();

  const toggleTheme = v => {
    const checked = typeof v === "boolean" ? v : !dark;
    setTheme(checked ? "dark" : "light");
  };

  const goToHadith = n => {
    navigate(`/hadith/${Math.max(1, Math.min(totalHadiths, Number(n)))}`);
    setOpen(false);
  };

  const handleGo = () => {
    const n = parseInt(String(goto).trim(), 10);
    if (!Number.isNaN(n)) { setGoto(""); goToHadith(n); }
  };

  const isActive = path => location.pathname === path;

  return (
    <>
      <NavbarStyles dark={dark} />
      <header className="nb-root">
        <div className="nb-inner">

          {/* ── Logo ── */}
          <Link to="/" className="nb-logo">
            <span className="nb-logo-badge">عمدة</span>
            <div className="nb-logo-text">
              <span className="nb-logo-title">Umdat al-Ahkam</span>
              <span className="nb-logo-sub">Mémorisation & Fiqh</span>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="nb-links">
            {NAV_LINKS.map(({ to, label, icon: Icon, accent }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to} to={to}
                  className={`nb-link ${active ? "nb-link--active" : ""}`}
                  style={{ "--accent": accent }}
                >
                  <Icon size={14} />
                  <span className="nb-link-label">{label}</span>
                  {active && <span className="nb-link-dot" aria-hidden="true" />}
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop actions ── */}
          <div className="nb-actions">
            <form className="nb-jump" onSubmit={e => { e.preventDefault(); handleGo(); }}>
              <input
                className="nb-jump-input" value={goto}
                onChange={e => setGoto(e.target.value)}
                placeholder="# Hadith" aria-label="Aller au hadith"
              />
              <button type="submit" className="nb-jump-btn" aria-label="Aller">
                <Search size={13} />
              </button>
            </form>

            <div className="nb-theme">
              <Sun size={12} />
              <Switch checked={dark} onCheckedChange={toggleTheme} className="nb-switch" />
              <Moon size={12} />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="nb-user-btn">
                  <User2 size={14} />
                  <span className="nb-user-label">
                    {user ? (user.name?.split(" ")[0] || "Profil") : "Connexion"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="nb-dropdown">
                {user ? (
                  <>
                    <div className="nb-dropdown-info">
                      <span className="nb-dropdown-name">{user.name || "Utilisateur"}</span>
                      <span className="nb-dropdown-email">{user.email}</span>
                    </div>
                    <DropdownMenuSeparator className="nb-sep" />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="nb-dropdown-item"><UserCircle size={14} /> Mon profil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="nb-sep" />
                    <DropdownMenuItem onClick={signOut} className="nb-dropdown-item nb-dropdown-item--danger">
                      <LogOut size={14} /> Se déconnecter
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="nb-dropdown-item"><User2 size={14} /> Se connecter</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ── Mobile ── */}
          <div className="nb-mobile-controls">
            <button className="nb-icon-btn" onClick={() => toggleTheme(!dark)} aria-label="Thème">
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="nb-icon-btn" aria-label="Menu"><Menu size={17} /></button>
              </SheetTrigger>
              <SheetContent side="right" className="nb-sheet">
                <div className="nb-sheet-header">
                  <span className="nb-logo-badge nb-logo-badge--sm">عمدة</span>
                  <div>
                    <p className="nb-sheet-title">Navigation</p>
                    <p className="nb-sheet-sub">Umdat al-Ahkam</p>
                  </div>
                </div>
                <div className="nb-sheet-section">
                  <p className="nb-sheet-section-label">Accès direct</p>
                  <form className="nb-jump nb-jump--full" onSubmit={e => { e.preventDefault(); handleGo(); }}>
                    <input className="nb-jump-input nb-jump-input--full" value={goto} onChange={e => setGoto(e.target.value)} placeholder="Numéro du hadith" />
                    <button type="submit" className="nb-jump-btn nb-jump-btn--label"><Search size={13} /> Aller</button>
                  </form>
                </div>
                <div className="nb-sheet-section">
                  <p className="nb-sheet-section-label">Pages</p>
                  <div className="nb-sheet-links">
                    {NAV_LINKS.map(({ to, label, icon: Icon, accent }) => {
                      const active = isActive(to);
                      return (
                        <Link key={to} to={to}
                          className={`nb-sheet-link ${active ? "nb-sheet-link--active" : ""}`}
                          style={{ "--accent": accent }} onClick={() => setOpen(false)}
                        >
                          <span className="nb-sheet-link-icon"><Icon size={15} /></span>
                          {label}
                          {active && <span className="nb-sheet-active-dot" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                <div className="nb-sheet-section nb-sheet-section--border">
                  <p className="nb-sheet-section-label">Compte</p>
                  {user ? (
                    <>
                      <div className="nb-sheet-user">
                        <span className="nb-sheet-user-name">{user.name || "Utilisateur"}</span>
                        <span className="nb-sheet-user-email">{user.email}</span>
                      </div>
                      <Link to="/profile" className="nb-sheet-link" style={{ "--accent": "#7a8694" }} onClick={() => setOpen(false)}>
                        <span className="nb-sheet-link-icon"><UserCircle size={15} /></span>Mon profil
                      </Link>
                      <button className="nb-sheet-link nb-sheet-link--danger" style={{ "--accent": "#c95a4a" }} onClick={() => { setOpen(false); signOut(); }}>
                        <span className="nb-sheet-link-icon"><LogOut size={15} /></span>Se déconnecter
                      </button>
                    </>
                  ) : (
                    <Link to="/profile" className="nb-sheet-link nb-sheet-link--cta" style={{ "--accent": "#4a9f82" }} onClick={() => setOpen(false)}>
                      <span className="nb-sheet-link-icon"><User2 size={15} /></span>Se connecter
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </header>
    </>
  );
}

function NavbarStyles({ dark }) {
  const light = {
    bg:      "rgba(250,246,238,.94)",
    surface: "#fff8ed",
    surface2:"#f3ead8",
    border:  "rgba(160,120,48,.18)",
    border2: "rgba(160,120,48,.32)",
    fg:      "#2c1f0e",
    muted:   "#7a6a48",
    gold:    "#a07830",
    hover:   "rgba(0,0,0,.04)",
  };
  const d = {
    bg:      "rgba(13,17,23,.88)",
    surface: "#161c24",
    surface2:"#1e2630",
    border:  "rgba(255,255,255,.08)",
    border2: "rgba(255,255,255,.14)",
    fg:      "#e8e0d0",
    muted:   "#7a8694",
    gold:    "#c9a84c",
    hover:   "rgba(255,255,255,.05)",
  };
  const t = dark ? d : light;

  return (
    <style>{`
      .nb-root {
        --bg:      ${t.bg};
        --surface: ${t.surface};
        --surface2:${t.surface2};
        --border:  ${t.border};
        --border2: ${t.border2};
        --fg:      ${t.fg};
        --muted:   ${t.muted};
        --gold:    ${t.gold};
        --hover:   ${t.hover};
        --serif:   Georgia, 'Times New Roman', serif;

        position: sticky; top: 0; z-index: 50;
        background: var(--bg);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-bottom: 1px solid var(--border);
        font-family: var(--serif);
        transition: background .3s, border-color .3s;
      }
      .nb-inner {
        max-width: 1200px; margin: 0 auto;
        padding: 0 1rem; height: 56px;
        display: flex; align-items: center; gap: 1rem;
      }

      /* logo */
      .nb-logo { display: flex; align-items: center; gap: .65rem; text-decoration: none; flex-shrink: 0; }
      .nb-logo-badge {
        display: inline-flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, #4a9f82, #2d7a62);
        color: #fff; font-size: .8rem; font-weight: 700;
        padding: .28rem .65rem; border-radius: 8px; letter-spacing: .04em;
        box-shadow: 0 2px 8px rgba(74,159,130,.35); flex-shrink: 0;
        transition: box-shadow .2s;
      }
      .nb-logo:hover .nb-logo-badge { box-shadow: 0 3px 14px rgba(74,159,130,.55); }
      .nb-logo-badge--sm { font-size: .75rem; padding: .22rem .55rem; }
      .nb-logo-text { display: none; line-height: 1.15; }
      @media (min-width: 640px) { .nb-logo-text { display: block; } }
      .nb-logo-title { display: block; font-size: .88rem; font-weight: 700; color: var(--fg); transition: color .3s; }
      .nb-logo-sub   { display: block; font-size: .65rem; color: var(--muted); font-style: italic; transition: color .3s; }

      /* desktop nav */
      .nb-links { display: none; align-items: center; gap: .15rem; flex: 1; overflow-x: auto; scrollbar-width: none; }
      .nb-links::-webkit-scrollbar { display: none; }
      @media (min-width: 768px) { .nb-links { display: flex; } }
      .nb-link {
        display: inline-flex; align-items: center; gap: .35rem;
        padding: .35rem .65rem; border-radius: 8px;
        font-size: .75rem; color: var(--muted);
        text-decoration: none; white-space: nowrap;
        position: relative;
        transition: color .15s, background .15s;
      }
      .nb-link:hover { color: var(--fg); background: var(--hover); }
      .nb-link--active { color: var(--accent) !important; background: color-mix(in srgb, var(--accent) 12%, transparent); }
      .nb-link-label { display: none; }
      @media (min-width: 1024px) { .nb-link-label { display: inline; } }
      .nb-link-dot {
        position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
        width: 4px; height: 4px; background: var(--accent); border-radius: 50%;
      }

      /* desktop actions */
      .nb-actions { display: none; align-items: center; gap: .55rem; flex-shrink: 0; }
      @media (min-width: 768px) { .nb-actions { display: flex; } }

      .nb-jump {
        display: flex; align-items: center;
        background: var(--surface2); border: 1px solid var(--border2);
        border-radius: 9px; overflow: hidden; height: 32px;
        transition: background .3s, border-color .15s;
      }
      .nb-jump--full { height: 38px; width: 100%; border-radius: 10px; }
      .nb-jump:focus-within { border-color: var(--gold); }
      .nb-jump-input {
        background: transparent; border: none; outline: none;
        color: var(--fg); font-size: .78rem; font-family: var(--serif);
        padding: 0 .6rem; width: 80px; transition: color .3s;
      }
      .nb-jump-input--full { flex: 1; width: auto; font-size: .83rem; padding: 0 .75rem; }
      .nb-jump-input::placeholder { color: var(--muted); }
      .nb-jump-btn {
        display: flex; align-items: center; justify-content: center;
        width: 30px; height: 100%;
        background: transparent; border: none; border-left: 1px solid var(--border);
        color: var(--muted); cursor: pointer;
        transition: color .15s, background .15s; flex-shrink: 0;
      }
      .nb-jump-btn:hover { color: var(--gold); background: color-mix(in srgb, var(--gold) 8%, transparent); }
      .nb-jump-btn--label {
        width: auto; gap: .3rem; padding: 0 .75rem;
        font-size: .78rem; font-family: var(--serif); color: var(--fg);
        display: flex; align-items: center;
      }
      .nb-jump-btn--label:hover { color: var(--gold); }

      .nb-theme {
        display: flex; align-items: center; gap: .35rem;
        background: var(--surface2); border: 1px solid var(--border2);
        border-radius: 9px; padding: 0 .55rem; height: 32px; color: var(--muted);
        transition: background .3s, border-color .3s;
      }
      .nb-switch {
        transform: scale(.75);
        border: 1px solid ${dark ? "rgba(201,168,76,.38)" : "rgba(160,120,48,.28)"} !important;
        background: ${dark ? "#1a2230" : "#d9cdae"} !important;
        box-shadow: inset 0 0 0 1px ${dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.45)"};
      }
      .nb-switch[data-state="checked"] {
        background: ${dark ? "linear-gradient(135deg, #2d7a62, #1f5f4b)" : "linear-gradient(135deg, #4a9f82, #2d7a62)"} !important;
        border-color: ${dark ? "rgba(74,159,130,.7)" : "rgba(45,122,98,.45)"} !important;
      }
      .nb-switch > span {
        background: ${dark ? "#e8e0d0" : "#fff8ed"} !important;
        box-shadow: 0 1px 4px rgba(0,0,0,.25);
      }

      .nb-user-btn {
        display: inline-flex; align-items: center; gap: .4rem;
        background: var(--surface2); border: 1px solid var(--border2);
        border-radius: 9px; padding: 0 .75rem; height: 32px;
        color: var(--fg); font-size: .78rem; font-family: var(--serif);
        cursor: pointer; transition: border-color .15s, background .3s;
      }
      .nb-user-btn:hover { border-color: var(--gold); }
      .nb-user-label { display: none; }
      @media (min-width: 1024px) { .nb-user-label { display: inline; } }

      /* dropdown */
      .nb-dropdown {
        background: var(--surface) !important; border: 1px solid var(--border2) !important;
        border-radius: 12px !important; padding: .35rem !important;
        box-shadow: 0 12px 32px rgba(0,0,0,.2) !important; min-width: 180px;
      }
      .nb-dropdown-info { padding: .5rem .6rem .4rem; display: flex; flex-direction: column; gap: .1rem; }
      .nb-dropdown-name  { font-size: .83rem; font-weight: 700; color: var(--fg); }
      .nb-dropdown-email { font-size: .7rem; color: var(--muted); }
      .nb-sep { background: var(--border) !important; margin: .25rem 0 !important; }
      .nb-dropdown-item {
        display: flex; align-items: center; gap: .5rem;
        font-size: .8rem; color: var(--fg); padding: .42rem .6rem;
        border-radius: 7px; cursor: pointer; text-decoration: none;
        font-family: var(--serif); transition: background .12s;
      }
      .nb-dropdown-item:hover { background: var(--hover); }
      .nb-dropdown-item--danger { color: #c95a4a !important; }
      .nb-dropdown-item--danger:hover { background: rgba(201,90,74,.1) !important; }

      /* mobile */
      .nb-mobile-controls { display: flex; align-items: center; gap: .5rem; margin-left: auto; }
      @media (min-width: 768px) { .nb-mobile-controls { display: none; } }

      /* Mobile buttons — full opacity, always clearly visible */
      .nb-icon-btn {
        display: flex; align-items: center; justify-content: center;
        width: 36px; height: 36px;
        background: ${dark ? "#1e2630" : "#f3ead8"};
        border: 1.5px solid ${dark ? "rgba(201,168,76,.45)" : "rgba(160,120,48,.4)"};
        border-radius: 10px;
        color: ${dark ? "#e8e0d0" : "#2c1f0e"};
        cursor: pointer;
        box-shadow: ${dark ? "0 2px 8px rgba(0,0,0,.5)" : "0 2px 6px rgba(160,120,48,.2)"};
        transition: border-color .15s, color .15s, background .15s, box-shadow .15s;
      }
      .nb-icon-btn:hover {
        border-color: var(--gold);
        color: var(--gold);
        background: ${dark ? "#252e3a" : "#ede4cc"};
        box-shadow: ${dark ? "0 3px 12px rgba(0,0,0,.6)" : "0 3px 10px rgba(160,120,48,.3)"};
      }
      .nb-icon-btn svg { flex-shrink: 0; }

      /* sheet — fully opaque, never transparent */
      .nb-sheet {
        background: ${dark ? "#0f151d" : "#fdf7ec"} !important;
        border-left: 1.5px solid ${dark ? "rgba(201,168,76,.25)" : "rgba(160,120,48,.3)"} !important;
        width: 300px !important; padding: 1.25rem 1rem 2rem !important;
        display: flex; flex-direction: column; gap: 0;
        box-shadow: ${dark ? "-8px 0 32px rgba(0,0,0,.6)" : "-8px 0 32px rgba(0,0,0,.12)"} !important;
      }
      .nb-sheet [data-slot="sheet-close"] {
        position: absolute; top: 1rem; right: 1rem;
        width: 30px !important; height: 30px !important;
        min-width: 30px !important; min-height: 30px !important;
        padding: 0 !important;
        box-sizing: border-box;
        background: ${dark ? "#1e2630" : "#ede4cc"} !important;
        border: 1.5px solid ${dark ? "rgba(201,168,76,.35)" : "rgba(160,120,48,.35)"} !important;
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        color: ${dark ? "#e8e0d0" : "#2c1f0e"} !important; cursor: pointer;
        opacity: 1 !important;
        transition: color .15s, background .15s, border-color .15s;
      }
      .nb-sheet [data-slot="sheet-close"]:hover {
        color: var(--gold) !important;
        background: ${dark ? "#252e3a" : "#e0d4b4"} !important;
        border-color: var(--gold) !important;
      }
      .nb-sheet [data-slot="sheet-close"] svg {
        width: 15px; height: 15px; flex-shrink: 0;
      }
      .nb-sheet-header {
        display: flex; align-items: center; gap: .75rem;
        padding-bottom: 1.1rem; border-bottom: 1px solid ${dark ? "rgba(201,168,76,.2)" : "rgba(160,120,48,.2)"};
        margin-bottom: 1.1rem;
      }
      .nb-sheet-title { font-size: .9rem; font-weight: 700; color: ${dark ? "#e8e0d0" : "#2c1f0e"}; margin: 0 0 .1rem; }
      .nb-sheet-sub   { font-size: .68rem; color: ${dark ? "#7a8694" : "#7a6a48"}; font-style: italic; margin: 0; }
      .nb-sheet-section { margin-bottom: 1.1rem; }
      .nb-sheet-section--border { padding-top: 1rem; border-top: 1px solid ${dark ? "rgba(255,255,255,.08)" : "rgba(160,120,48,.15)"}; }
      .nb-sheet-section-label {
        font-size: .65rem; color: ${dark ? "#7a8694" : "#7a6a48"};
        text-transform: uppercase; letter-spacing: .09em; margin-bottom: .5rem;
      }
      .nb-sheet-links { display: flex; flex-direction: column; gap: .2rem; }
      .nb-sheet-link {
        display: flex; align-items: center; gap: .65rem;
        padding: .5rem .65rem; border-radius: 9px;
        font-size: .83rem; color: ${dark ? "#a09080" : "#5a4a30"};
        text-decoration: none; background: transparent; border: none;
        cursor: pointer; font-family: var(--serif);
        transition: background .13s, color .13s;
        position: relative; width: 100%; text-align: left;
      }
      .nb-sheet-link:hover {
        background: ${dark ? "rgba(255,255,255,.07)" : "rgba(160,120,48,.08)"};
        color: ${dark ? "#e8e0d0" : "#2c1f0e"};
      }
      .nb-sheet-link--active { color: var(--accent) !important; background: color-mix(in srgb, var(--accent) 12%, transparent) !important; }
      .nb-sheet-link--danger { color: #c95a4a !important; }
      .nb-sheet-link--danger:hover { background: rgba(201,90,74,.12) !important; }
      .nb-sheet-link--cta { color: #4a9f82 !important; font-weight: 700; }
      .nb-sheet-link--cta:hover { background: rgba(74,159,130,.12) !important; }
      .nb-sheet-link-icon {
        width: 28px; height: 28px; flex-shrink: 0;
        background: color-mix(in srgb, var(--accent) 18%, transparent);
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        color: var(--accent);
      }
      .nb-sheet-active-dot {
        position: absolute; right: .75rem;
        width: 6px; height: 6px; background: var(--accent); border-radius: 50%;
      }
      .nb-sheet-user {
        background: ${dark ? "#1a2230" : "#ede4cc"};
        border: 1px solid ${dark ? "rgba(201,168,76,.2)" : "rgba(160,120,48,.25)"};
        border-radius: 9px; padding: .7rem .8rem; margin-bottom: .4rem;
      }
      .nb-sheet-user-name  { display: block; font-size: .85rem; font-weight: 700; color: ${dark ? "#e8e0d0" : "#2c1f0e"}; }
      .nb-sheet-user-email { display: block; font-size: .7rem; color: ${dark ? "#7a8694" : "#7a6a48"}; margin-top: .15rem; }

      /* jump inside sheet */
      .nb-jump--full { height: 40px; width: 100%; border-radius: 10px;
        background: ${dark ? "#1a2230" : "#ede4cc"} !important;
        border: 1.5px solid ${dark ? "rgba(201,168,76,.3)" : "rgba(160,120,48,.35)"} !important;
      }
      .nb-jump--full:focus-within { border-color: var(--gold) !important; }
    `}</style>
  );
}

export default Navbar;
