// /src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"; // ⬅️ pas de SheetClose
import { Input } from "@/components/ui/input";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  Layers,
  RefreshCw,
  Scale,
  User2,
  Menu,
  Search,
} from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // contrôle du menu burger
  const [open, setOpen] = useState(false);
  const [goto, setGoto] = useState("");

  const handleGo = () => {
    const n = parseInt(goto, 10);
    if (Number.isNaN(n)) return;
    navigate(`/hadith/${n}`);
    setGoto("");
    setOpen(false); // ferme le sheet
  };

  // Liens desktop
  const Links = () => (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link to="/learn" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Apprendre
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link to="/review" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Réviser
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link to="/quiz" className="flex items-center gap-2">
          <Layers className="h-4 w-4" /> Quiz
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link to="/compare" className="flex items-center gap-2">
          <Scale className="h-4 w-4" /> Comparer
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link to="/exam" className="flex items-center gap-2">
          Examen
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link to="/exam/targeted" className="flex items-center gap-2">
          Révision ciblée
        </Link>
      </Button>
    </div>
  );

  // Lien mobile qui ferme le sheet
  const MobileNavLink = ({ to, children }) => (
    <Button
      variant="ghost"
      className="w-full justify-start"
      asChild
      onClick={() => setOpen(false)}
    >
      <Link to={to}>{children}</Link>
    </Button>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Umdat
          </Badge>
          <span className="font-semibold tracking-wide">Hadith • Fiqh</span>
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <Links />

          {/* accès direct par numéro */}
          <div className="flex items-center gap-2 ml-2">
            <Input
              value={goto}
              onChange={(e) => setGoto(e.target.value)}
              placeholder="# Hadith"
              className="h-8 w-28"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGo();
              }}
            />
            <Button size="sm" variant="outline" onClick={handleGo} className="gap-1">
              <Search className="h-4 w-4" />
              Ouvrir
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-1">
                <User2 className="h-4 w-4" />
                {user ? "Profil" : "Connexion"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Mon profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    Se déconnecter
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/profile">Se connecter</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile */}
        <div className="sm:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu de navigation</SheetTitle>
                <SheetDescription>
                  Accède aux pages et ouvre un hadith par numéro.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                {/* Accès direct numéro */}
                <div className="flex items-center gap-2">
                  <Input
                    value={goto}
                    onChange={(e) => setGoto(e.target.value)}
                    placeholder="# Hadith"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleGo();
                    }}
                  />
                  <Button variant="outline" onClick={handleGo} className="gap-1">
                    <Search className="h-4 w-4" />
                    Go
                  </Button>
                </div>

                {/* Liens */}
                <div className="space-y-2">
                  <MobileNavLink to="/learn">Apprendre</MobileNavLink>
                  <MobileNavLink to="/review">Réviser</MobileNavLink>
                  <MobileNavLink to="/quiz">Quiz</MobileNavLink>
                  <MobileNavLink to="/compare">Comparer</MobileNavLink>
                  <MobileNavLink to="/exam">Examen</MobileNavLink>
                  <MobileNavLink to="/exam/targeted">Révision ciblée</MobileNavLink>
                </div>

                <div className="pt-4 border-t">
                  {user ? (
                    <div className="flex flex-col gap-2">
                      <MobileNavLink to="/profile">Mon profil</MobileNavLink>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setOpen(false);
                          signOut();
                        }}
                      >
                        Se déconnecter
                      </Button>
                    </div>
                  ) : (
                    <MobileNavLink to="/profile">Se connecter</MobileNavLink>
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
