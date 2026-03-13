import { useState } from "react";
import { Play, RotateCcw, Lightbulb, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface ControlPanelProps {
  onRun: (command: string) => void;
  onClear: () => void;
  onExample: () => void;
  isRunning: boolean;
  isLoading?: boolean;
}

const ControlPanel = ({ onRun, onClear, onExample, isRunning, isLoading = false }: ControlPanelProps) => {
  const { t, language } = useLanguage();
  const [command, setCommand] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim() && !isLoading) {
      onRun(command);
    }
  };

  const isDisabled = isLoading;

  return (
    <div className="w-full space-y-4 animate-fade-in">
      {/* Input Area */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="gradient-border rounded-xl overflow-hidden">
          <div className="relative bg-card/80 backdrop-blur-sm">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder={t('control.placeholder')}
              className="w-full px-6 py-4 pr-14 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm md:text-base transition-all duration-300"
              disabled={isDisabled}
            />
            <button
              type="submit"
              disabled={!command.trim() || isDisabled}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors duration-200",
                command.trim() && !isDisabled
                  ? "bg-primary text-primary-foreground hover:box-glow"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => command && onRun(command)}
          disabled={!command.trim() || isDisabled}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isLoading ? t('control.processing') : t('control.run')}
        </Button>

        <Button
          onClick={onClear}
          variant="outline"
          className="gap-2 border-border hover:border-primary/50 hover:bg-primary/5 text-foreground"
          disabled={isLoading}
        >
          <RotateCcw className="w-4 h-4" />
          {t('control.clear')}
        </Button>

        <Button
          onClick={() => {
            setCommand(language === 'al' ? "vrimë e zezë" : "black hole");
            onExample();
          }}
          variant="ghost"
          className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5"
          disabled={isLoading}
        >
          <Lightbulb className="w-4 h-4" />
          {t('control.example')}
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;
