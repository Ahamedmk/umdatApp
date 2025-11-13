import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  User2,
  Mail,
  LogOut,
  LogIn,
  Shield,
  Moon,
  Sun,
  Trophy,
  BookOpen,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Sparkles,
  Info,
  RotateCcw,
} from 'lucide-react';

const useAuth = () => ({
  user: null,
  signIn: (email) => console.log('Sign in:', email),
  signOut: () => console.log('Sign out')
});

export function Profile() {
  const { user, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [stats] = useState({
    learned: 3,
    learning: 5,
    total: 8,
    streak: 7
  });

  useEffect(() => {
    const pref = localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const enable = pref ? pref === 'dark' : prefersDark;
    setDark(enable);
    document.documentElement.classList.toggle('dark', enable);
  }, []);

  const toggleTheme = (checked) => {
    setDark(checked);
    document.documentElement.classList.toggle('dark', checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
  };

  const handleSignIn = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await signIn(email);
    } finally {
      setLoading(false);
    }
  };

  const progressPct = Math.round((stats.learned / stats.total) * 100);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 p-6">
        <div className="max-w-md mx-auto space-y-6 pt-12">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
              <User2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Connexion
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Accède à ta progression et synchronise tes données
            </p>
          </div>
{/* 
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-full shadow-sm border">
              <Sun className="h-4 w-4" />
              <Switch checked={dark} onCheckedChange={toggleTheme} />
              <Moon className="h-4 w-4" />
            </div>
          </div> */}

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-indigo-500" />
                Connexion par email
              </CardTitle>
              <CardDescription>
                Reçois un lien magique dans ta boîte mail
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Adresse email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  className="h-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSignIn();
                  }}
                />
              </div>

              <Button
                onClick={handleSignIn}
                disabled={!email.trim() || loading}
                className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Recevoir le lien
                  </>
                )}
              </Button>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    Vérifie ta boîte mail et clique sur le lien. Pas de mot de passe !
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Avantages du compte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span>Synchronisation multi-appareils</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>Sauvegarde sécurisée</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <span>Statistiques détaillées</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <User2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mon Profil</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Gère ton compte</p>
            </div>
          </div>
          
          {/* <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-full shadow-sm border">
            <Sun className="h-4 w-4" />
            <Switch checked={dark} onCheckedChange={toggleTheme} />
            <Moon className="h-4 w-4" />
          </div> */}
        </div>

        <Card className="shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
          
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <User2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-500 mb-1">Adresse email</div>
                <div className="font-semibold">{user.email}</div>
              </div>
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600">
                Connecté
              </Badge>
            </div>

            <div className="mt-6">
              <Button
                onClick={signOut}
                variant="outline"
                className="w-full gap-2 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-8 w-8 text-emerald-600" />
                <Badge variant="outline">{stats.learned}</Badge>
              </div>
              <div className="text-2xl font-bold text-emerald-700 mb-1">{stats.learned}</div>
              <div className="text-xs text-emerald-600">Maîtrisés</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <Badge variant="outline">{stats.learning}</Badge>
              </div>
              <div className="text-2xl font-bold text-blue-700 mb-1">{stats.learning}</div>
              <div className="text-xs text-blue-600">En cours</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <Badge variant="outline">{progressPct}%</Badge>
              </div>
              <div className="text-2xl font-bold text-purple-700 mb-1">{progressPct}%</div>
              <div className="text-xs text-purple-600">Progression</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-8 w-8 text-orange-600" />
                <Badge variant="outline">🔥</Badge>
              </div>
              <div className="text-2xl font-bold text-orange-700 mb-1">{stats.streak}</div>
              <div className="text-xs text-orange-600">Jours streak</div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Progression
            </CardTitle>
            <CardDescription>Umdat al-Ahkam</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Hadiths maîtrisés</span>
                <span className="font-semibold">{stats.learned}/{stats.total}</span>
              </div>
              <Progress value={progressPct} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                <div className="text-3xl font-bold text-emerald-600 mb-1">{stats.learned}</div>
                <div className="text-xs text-emerald-700">Maîtrisés</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <div className="text-3xl font-bold text-blue-600 mb-1">{stats.learning}</div>
                <div className="text-xs text-blue-700">En cours</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start gap-2">
                <RotateCcw className="h-4 w-4" />
                Réviser
              </Button>
              <Button variant="outline" className="justify-start gap-2">
                <BookOpen className="h-4 w-4" />
                Apprendre
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Profile;