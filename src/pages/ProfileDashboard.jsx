// /src/pages/ProfileDashboard.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  User2,
  Shield,
  LogOut,
  Trophy,
  BookOpen,
  TrendingUp,
  Calendar,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export function ProfileDashboard({ user, stats, onSignOut }) {

    const learned = stats?.learned ?? 0;
  const learning = stats?.learning ?? 0;
  const total = stats?.total ?? 1; // éviter division par 0
  const streak = stats?.streak ?? 0;
  const progressPct = Math.round((learned /total) * 100);
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <User2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mon Profil</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Gère ton compte</p>
            </div>
          </div>
        </div>

        {/* Carte infos compte */}
        <Card className="shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
          
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <User2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-500 mb-1">Adresse email</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {user.email}
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
                Connecté
              </Badge>
            </div>

            <div className="mt-6">
              <Button
                onClick={onSignOut}
                variant="outline"
                className="w-full gap-2 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats rapides */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-8 w-8 text-emerald-600" />
                <Badge variant="outline">{learned}</Badge>
              </div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                {learned}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Maîtrisés</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <Badge variant="outline">{learning}</Badge>
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-1">
                {learning}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">En cours</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <Badge variant="outline">{progressPct}%</Badge>
              </div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-1">
                {progressPct}%
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Progression</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-8 w-8 text-orange-600" />
                <Badge variant="outline">🔥</Badge>
              </div>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300 mb-1">
                {streak}
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400">Jours streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Bloc progression détaillée */}
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
                <span className="font-semibold">
                  {learned}/{total}
                </span>
              </div>
              <Progress value={progressPct} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-300 mb-1">
                  {learned}
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400">
                  Maîtrisés
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-300 mb-1">
                  {learning}
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-400">
                  En cours
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Actions rapides
            </CardTitle>
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

export default ProfileDashboard;
