import { BookOpen, Atom, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

import { motion } from "framer-motion";

interface ExplanationPanelProps {
  explanation: string;
  isVisible: boolean;
}

const ExplanationPanel = ({ explanation, isVisible }: ExplanationPanelProps) => {
  const { t } = useLanguage();
  if (!isVisible || !explanation) return null;

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="gradient-border rounded-xl p-6 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display text-sm font-semibold tracking-wide text-primary">
            {t('explanation.title')}
          </h3>
        </div>

        <p className="text-foreground/90 leading-relaxed">
          {explanation}
        </p>

        <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4" />
            <span>{t('hero.physicsBadge')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>{t('explanation.footer')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExplanationPanel;
