// /src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

import {
  BookOpen,
  Brain,
  RotateCcw,
  Scale3d,
  User2,
  Menu,
  Search,
  Moon,
  Sun,
  LogOut,
  UserCircle,
  Sparkles,
  Target,
  BarChart3,
  Map,
  ClipboardCheck,
  X,
  History, // 👈 pour le bouton Historique des révisions
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [goto, setGoto] = useState("");
  const [dark, setDark] = useState(false);

  // Thème
  useEffect(() => {
    const pref = localStorage.getItem("theme");
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enable = pref ? pref === "dark" : prefersDark;
    setDark(enable);
    document.documentElement.classList.toggle("dark", enable);
  }, []);

  const toggleTheme = (checked) => {
    setDark(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  // Aller à un hadith par numéro
  const goToHadith = (n) => {
    const num = Math.max(1, Math.min(15, Number(n)));
    navigate(`/hadith/${num}`);
    setOpen(false);
  };

  const handleGo = () => {
    const n = parseInt(String(goto).trim(), 10);
    if (!Number.isNaN(n)) {
      setGoto("");
      goToHadith(n);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    {
      to: "/learn",
      label: "Apprendre",
      icon: BookOpen,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      to: "/review",
      label: "Réviser",
      icon: RotateCcw,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
  to: "/progress",
  label: "Progression",
  icon: BarChart3,
  gradient: "from-violet-500 to-purple-600",
},
    {
      to: "/quiz",
      label: "Quiz",
      icon: Brain,
      gradient: "from-purple-500 to-pink-600",
    },
    {
      to: "/compare",
      label: "Comparer",
      icon: Scale3d,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      to: "/exam",
      label: "Examen",
      icon: ClipboardCheck,
      gradient: "from-red-500 to-rose-600",
    },
    {
      to: "/exam/targeted",
      label: "Ciblé",
      icon: Target,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
    to: "/timeline",
    label: "Timeline Sîra",
    icon: Map,
    gradient: "from-emerald-500 to-sky-500",
  },
    // 👇 Nouveau bouton : Historique des révisions
    {
      to: "/history",
      label: "Historique",
      icon: History,
      gradient: "from-slate-500 to-slate-800",
    },
    {
      to: "/narrators",
      label: "Rapporteurs",
      icon: Sparkles,
      gradient: "from-fuchsia-500 to-pink-600",
    },
  ];

  const NavLink = ({ to, label, icon: Icon, gradient, mobile = false }) => {
    const active = isActive(to);

    if (mobile) {
      return (
        <Button
          variant={active ? "default" : "ghost"}
          className={`w-full justify-start gap-2 ${
            active ? `bg-gradient-to-r ${gradient} text-black` : ""
          }`}
          asChild
          onClick={() => setOpen(false)}
        >
          <Link to={to}>
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        </Button>
      );
    }

    return (
      <Button
        asChild
        variant="ghost"
        size="sm"
        className={`gap-2 relative ${
          active
            ? "bg-gradient-to-r " + gradient + " text-white hover:opacity-90"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        <Link to={to}>
          <Icon className="h-4 w-4" />
          <span className="hidden lg:inline">{label}</span>
          {active && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
          )}
        </Link>
      </Button>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
            <Badge
              variant="secondary"
              className="relative rounded-xl px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md"
            >
              <Sparkles className="h-3 w-3 inline mr-1" />
              عمدة
            </Badge>
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
              Umdat al-Ahkam
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
              Mémorisation & Fiqh
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink key={link.to} {...link} />
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2 ">
          {/* Quick Jump */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGo();
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <Input
              value={goto}
              onChange={(e) => setGoto(e.target.value)}
              placeholder="# Hadith"
              className="h-7 w-24 text-sm border-0 bg-transparent focus-visible:ring-0"
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 dark:bg-slate-800 "
              type="submit"
            >
              <Search className=" dark:text-slate-800  " />
            </Button>
          </form>

          {/* Theme Toggle */}
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <Sun className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
            <Switch checked={dark} onCheckedChange={toggleTheme} className="scale-75" />
            <Moon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-slate-200 dark:bg-slate-800 dark:border-slate-200"
              >
                <User2 className="h-4 w-4 dark:text-slate-800" />
                <span className="hidden lg:inline dark:text-slate-800">
                  {user ? user.name?.split(" ")[0] || "Profil" : "Connexion"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user ? (
                <>
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {user.name || "Utilisateur"}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <UserCircle className="h-4 w-4 mr-2" />
                      Mon profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="text-red-600 dark:text-red-400 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User2 className="h-4 w-4 mr-2" />
                    Se connecter
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          {/* Theme Toggle Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleTheme(!dark)}
            className="h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800 da "
          >
            {dark ? (
              <Sun className="h-4 w-4 text-slate-700 dark:text-slate-500 " />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 dark:text-slate-500 " />
            )}
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 "
              >
                <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              {/* Bouton de fermeture personnalisé */}
              <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                <X className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                <span className="sr-only">Close</span>
              </SheetClose>

              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Sparkles className="h-5 w-5 text-emerald-500" />
                  Navigation
                </SheetTitle>
                <SheetDescription className="text-slate-600 dark:text-slate-400">
                  Accède rapidement aux différentes sections
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Quick Jump mobile */}
                <div className="space-y-2">
                  <label className="text-sm font-medium px-2.5 text-slate-700 dark:text-slate-300">
                    Accès direct
                  </label>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleGo();
                    }}
                    className="flex items-center px-2.5 gap-2"
                  >
                    <Input
                      value={goto}
                      onChange={(e) => setGoto(e.target.value)}
                      placeholder="Numéro du hadith"
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      variant="default"
                      className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600"
                    >
                      <Search className="h-4 w-4" />
                      Go
                    </Button>
                  </form>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2 mx-3">
                  <label className="text-sm font-medium px-2.5 text-slate-700 dark:text-slate-300">
                    Pages principales
                  </label>
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <NavLink key={link.to} {...link} mobile />
                    ))}
                  </div>
                </div>

                {/* User Section */}
                <div className="pt-4 border-t mx-3 border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="text-sm font-medium text-slate-700 px-2 dark:text-slate-300">
                    Compte
                  </label>
                  {user ? (
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {user.name || "Utilisateur"}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {user.email}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        asChild
                        onClick={() => setOpen(false)}
                      >
                        <Link to="/profile">
                          <UserCircle className="h-4 w-4" />
                          Mon profil
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => {
                          setOpen(false);
                          signOut();
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Se déconnecter
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600"
                      asChild
                      onClick={() => setOpen(false)}
                    >
                      <Link to="/profile">
                        <User2 className="h-4 w-4" />
                        Se connecter
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
