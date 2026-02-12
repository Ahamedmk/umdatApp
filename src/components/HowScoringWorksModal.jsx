import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Brain, Target, RefreshCw, Trophy, Sparkles } from "lucide-react";

export default function HowScoringWorksDialog() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  const scoreItems = [
    { score: "0", label: "Trou noir", color: "text-red-600 dark:text-red-400" },
    { score: "1", label: "Très difficile", color: "text-orange-600 dark:text-orange-400" },
    { score: "2", label: "Après avoir regardé", color: "text-amber-600 dark:text-amber-400" },
    { score: "3", label: "Quelques hésitations", color: "text-yellow-600 dark:text-yellow-400" },
    { score: "4", label: "Fluide", color: "text-lime-600 dark:text-lime-400" },
    { score: "5", label: "Parfait", color: "text-emerald-600 dark:text-emerald-400" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="group rounded-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all hover:shadow-md hover:scale-105"
        >

          Comment ça marche ?
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

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800"
          >
            <p className="text-sm text-slate-700 dark:text-slate-200">
              L'objectif est de mémoriser sur le long terme grâce à la{" "}
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                révision espacée intelligente
              </span>.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Section Notation */}
            <motion.div variants={item} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-lg">Comment te noter (0–5)</h3>
              </div>
              
              <div className="grid gap-2">
                {scoreItems.map((scoreItem, index) => (
                  <motion.div
                    key={scoreItem.score}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${scoreItem.color} bg-white dark:bg-slate-900 shadow-sm group-hover:scale-110 transition-transform`}>
                      {scoreItem.score}
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {scoreItem.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Section Après la note */}
            <motion.div variants={item} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Après la note</h3>
              </div>
              
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                  <span className="font-semibold text-red-700 dark:text-red-400">0–2</span>
                  <span className="text-sm text-slate-700 dark:text-slate-200"> → revient vite</span>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
                  <span className="font-semibold text-yellow-700 dark:text-yellow-400">3</span>
                  <span className="text-sm text-slate-700 dark:text-slate-200"> → consolidation</span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">4–5</span>
                  <span className="text-sm text-slate-700 dark:text-slate-200"> → devient </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Appris</span>
                </div>
              </div>
            </motion.div>

            {/* Section Maîtrisé */}
            <motion.div variants={item} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-lg">Quand devient-il Maîtrisé ?</h3>
              </div>
              
              <p className="text-sm text-slate-700 dark:text-slate-200 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                Après plusieurs bonnes notes espacées dans le temps.
                Cela signifie que ton cerveau le retient durablement.
              </p>
            </motion.div>

            {/* Conclusion */}
            <motion.div
              variants={item}
              className="p-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
            >
              <p className="font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Maîtriser = pouvoir réciter après plusieurs semaines
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}