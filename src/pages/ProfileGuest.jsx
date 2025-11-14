// /src/pages/ProfileGuest.jsx
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  User2,
  Mail,
  LogIn,
  Info,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function ProfileGuest({ onSignIn }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await onSignIn(email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 p-6">
      <div className="max-w-md mx-auto space-y-6 pt-12">
        {/* Header */}
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

        {/* Carte connexion email */}
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
                  if (e.key === "Enter") handleSignIn();
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

        {/* Avantages du compte */}
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

export default ProfileGuest;
