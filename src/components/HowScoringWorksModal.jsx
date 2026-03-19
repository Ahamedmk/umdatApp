import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Brain,
  Target,
  RefreshCw,
  Trophy,
  Sparkles,
  CalendarClock,
} from "lucide-react";

export default function HowScoringWorksModal({
  triggerText = "Comment ça marche ?",
}) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  const scoreItems = [
    {
      score: "0",
      label: "Trou noir",
      desc: "Tu ne t’en souviens pas du tout",
      delay: "Revient demain",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
    },
    {
      score: "1",
      label: "Très difficile",
      desc: "Tu t’en souviens à peine",
      delay: "Revient demain",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900",
    },
    {
      score: "2",
      label: "Après avoir regardé",
      desc: "Tu bloques au début, puis ça revient",
      delay: "Revient demain",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900",
    },
    {
      score: "3",
      label: "Quelques hésitations",
      desc: "Tu récites sans regarder, mais avec hésitations",
      delay: "Revient dans 2 jours",
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900",
    },
    {
      score: "4",
      label: "Fluide",
      desc: "Tu récites presque sans effort",
      delay: "Revient dans 3 jours",
      color: "text-lime-600 dark:text-lime-400",
      bg: "bg-lime-50 dark:bg-lime-950/20 border-lime-200 dark:border-lime-900",
    },
    {
      score: "5",
      label: "Parfait",
      desc: "Tu récites immédiatement, sans hésitation",
      delay: "Revient dans 4 jours",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900",
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="group rounded-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all hover:shadow-md hover:scale-105"
        >
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="space-y-6"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Brain className="w-6 h-6 text-emerald-600" />
              Comment fonctionne la progression ?
            </DialogTitle>
          </DialogHeader>

          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800"
          >
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              Le but est de mémoriser sur le long terme grâce à la{" "}
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                révision espacée
              </span>
              . Plus ta récitation est solide, plus le hadith revient tard.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Section notes */}
            <motion.div variants={item} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-lg">Comment te noter (0 à 5)</h3>
              </div>

              <div className="grid gap-2">
                {scoreItems.map((scoreItem, index) => (
                  <motion.div
                    key={scoreItem.score}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.05 }}
                    className={`p-3 rounded-lg border ${scoreItem.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${scoreItem.color} bg-white dark:bg-slate-900 shadow-sm shrink-0`}
                      >
                        {scoreItem.score}
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {scoreItem.label}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {scoreItem.desc}
                        </p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {scoreItem.delay}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Section après la note */}
            <motion.div variants={item} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Les étapes de progression</h3>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    Nouveau
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    {" "}
                    → pas encore travaillé
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                  <span className="font-semibold text-blue-700 dark:text-blue-400">
                    En cours
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    {" "}
                    → tant que tu mets 0, 1, 2 ou 3
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900">
                  <span className="font-semibold text-teal-700 dark:text-teal-400">
                    Appris
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    {" "}
                    → dès que tu mets 4 ou 5
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Maîtrisé
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    {" "}
                    → après 3 validations fortes (4 ou 5) espacées d’au moins 5 jours
                  </span>
                </div>
              </div>
            </motion.div>

            {/* maîtrise */}
            <motion.div variants={item} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-lg">
                  Quand devient-il maîtrisé ?
                </h3>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-2">
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Un hadith devient <span className="font-semibold">Maîtrisé</span>{" "}
                  après :
                </p>
                <ul className="text-sm text-slate-700 dark:text-slate-200 space-y-1 pl-5 list-disc">
                  <li>3 notes fortes : 4 ou 5</li>
                  <li>avec au moins 5 jours d’écart entre chaque validation</li>
                </ul>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Exemple : Jour 1 = 5, Jour 6 = 4, Jour 12 = 5 → le hadith devient maîtrisé.
                </p>
              </div>
            </motion.div>

            {/* après maîtrise */}
            <motion.div variants={item} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <CalendarClock className="w-5 h-5 text-violet-600" />
                <h3 className="font-semibold text-lg">Après la maîtrise</h3>
              </div>

              <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900">
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  Un hadith maîtrisé <span className="font-semibold">continue de revenir</span>,
                  mais de façon plus espacée.  
                  Le but est de vérifier qu’il reste solide même après plusieurs jours
                  ou semaines.
                </p>
              </div>
            </motion.div>

            {/* conclusion */}
            <motion.div
              variants={item}
              className="p-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
            >
              <p className="font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Maîtriser un hadith, ce n’est pas juste le réciter une fois, c’est
                pouvoir le retrouver encore plus tard.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}