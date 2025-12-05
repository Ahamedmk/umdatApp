// src/components/narrators/NarratorUnlockDialog.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export function NarratorUnlockDialog({ narrator, open, onOpenChange }) {
  if (!narrator) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-slate-900 text-white border border-amber-400/60 shadow-xl">
        <DialogHeader className="flex flex-row items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <DialogTitle>Nouvelle carte débloquée !</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-lg">
            {narrator.avatar ? (
              <img
                src={narrator.avatar}
                alt={narrator.name_fr}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-500/80 to-rose-500/80 text-2xl font-bold">
                {narrator.name_fr?.[0] ?? "?"}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm text-slate-300">
              Vous venez de débloquer :
            </p>
            <p className="text-lg font-semibold">
              {narrator.name_fr}{" "}
              <span className="text-amber-300 block text-sm">
                {narrator.name_ar}
              </span>
            </p>

            <Badge
              variant="outline"
              className="border-amber-400/60 text-amber-100"
            >
              Rareté : {narrator.rarity}
            </Badge>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-300">
          Continue à apprendre les hadiths pour débloquer encore plus de
          rapporteurs et compléter ta collection in shâ’ Allâh ✨
        </p>
      </DialogContent>
    </Dialog>
  );
}
