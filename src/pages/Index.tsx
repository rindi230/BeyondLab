import { useState, useCallback } from "react";
import { GLSLHills } from "@/components/ui/glsl-hills";
import Header from "@/components/Header";
import { SimulationCanvas3D } from "@/components/simulations3d";
import SimulationControls from "@/components/simulations3d/SimulationControls";
import ControlPanel from "@/components/ControlPanel";
import ExplanationPanel from "@/components/ExplanationPanel";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import FeaturesSection from "@/components/FeaturesSection";
import ContactSection from "@/components/ContactSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import { Sparkles, Beaker, Cpu } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";

interface SimulationParameters {
  gravity?: number;
  mass?: number;
  velocity?: number;
  angle?: number;
  elasticity?: number;
  particleCount?: number;
  color?: string;
  size?: number;
  duration?: number;
  intensity?: number;
}

import { motion, Variants } from "framer-motion";

const Index = () => {
  const { t, language } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [simulationType, setSimulationType] = useState("");
  const [simulationParams, setSimulationParams] = useState<SimulationParameters>({});
  const [initialParams, setInitialParams] = useState<SimulationParameters>({});
  const [explanation, setExplanation] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const handleRun = async (command: string) => {
    setIsLoading(true);
    setIsRunning(false);
    setShowExplanation(false);
    setExplanation("");

    try {
      console.log("Sending command to AI:", command);

      // Client-side overrides for reliable loading
      const lowerCommand = command.toLowerCase();
      if (lowerCommand.includes('projectile') || lowerCommand.includes('hedhja') || lowerCommand.includes('hedhje') || lowerCommand.includes('parabolic') || lowerCommand.includes('trajektorja')) {
        const params = { velocity: 30, angle: 45, gravity: 9.8 };
        setSimulationType("projectile_motion");
        setSimulationParams(params);
        setInitialParams(params);
        setExplanation(t('overrides.physics'));
        setIsRunning(true);
        setIsLoading(false);
        setTimeout(() => setShowExplanation(true), 1000);
        return;
      }

      if (lowerCommand.includes('human') || lowerCommand.includes('anatomy') || lowerCommand.includes('body') || lowerCommand.includes('trupi i njeriut') || lowerCommand.includes('anatomia')) {
        const params = {};
        setSimulationType("human_anatomy");
        setSimulationParams(params);
        setInitialParams(params);
        setExplanation(t('overrides.anatomy'));
        setIsRunning(true);
        setIsLoading(false);
        setTimeout(() => setShowExplanation(true), 1000);
        return;
      }

      if (lowerCommand.includes('quantum tunnel') || lowerCommand.includes('tunneling') || lowerCommand.includes('tunelimi') || lowerCommand.includes('kuantik')) {
        const params = { intensity: 1.5, color: "purple", particleCount: 200 };
        setSimulationType("quantum_tunneling");
        setSimulationParams(params);
        setInitialParams(params);
        setExplanation(t('overrides.quantum'));
        setIsRunning(true);
        setIsLoading(false);
        setTimeout(() => setShowExplanation(true), 1000);
        return;
      }

      if (lowerCommand.includes('gravity') || lowerCommand.includes('falling') || lowerCommand.includes('drop') || lowerCommand.includes('graviteti') || lowerCommand.includes('rënia') || lowerCommand.includes('rëndesa')) {
        const params = { gravity: 9.8, color: "blue", size: 20, particleCount: 150 };
        setSimulationType("gravity");
        setSimulationParams(params);
        setInitialParams(params);
        setExplanation(t('overrides.gravity'));
        setIsRunning(true);
        setIsLoading(false);
        setTimeout(() => setShowExplanation(true), 1000);
        return;
      }

      if (lowerCommand.includes('physics') || lowerCommand.includes('mechanics') || lowerCommand.includes('fizika') || lowerCommand.includes('mekanika') || lowerCommand.includes('lavjerrësi')) {
        const params = { gravity: 9.8 };
        setSimulationType("pendulum");
        setSimulationParams(params);
        setInitialParams(params);
        setExplanation(t('overrides.physics'));
        setIsRunning(true);
        setIsLoading(false);
        setTimeout(() => setShowExplanation(true), 1000);
        return;
      }

      if (lowerCommand.includes('cell') || lowerCommand.includes('dna') || lowerCommand.includes('biology') || lowerCommand.includes('qeliza') || lowerCommand.includes('biologjia') || lowerCommand.includes('adn')) {
        const params = {};
        setSimulationType("cell_structure");
        setSimulationParams(params);
        setInitialParams(params);
        setExplanation(t('overrides.biology'));
        setIsRunning(true);
        setIsLoading(false);
        setTimeout(() => setShowExplanation(true), 1000);
        return;
      }

      if (lowerCommand.includes('chemistry') || lowerCommand.includes('reaction') || lowerCommand.includes('molecule') || lowerCommand.includes('kimia') || lowerCommand.includes('reaksion') || lowerCommand.includes('molekula') || lowerCommand.includes('tabela periodike')) {
        const params = { color: "green", particleCount: 100 };
        setSimulationType("chemical_reaction");
        setSimulationParams(params);
        setInitialParams(params);
        setExplanation(t('overrides.chemistry'));
        setIsRunning(true);
        setIsLoading(false);
        setTimeout(() => setShowExplanation(true), 1000);
        return;
      }

      if (lowerCommand.includes('space') || lowerCommand.includes('star') || lowerCommand.includes('planet') || lowerCommand.includes('galaxy') || lowerCommand.includes('hapësira') || lowerCommand.includes('planeti') || lowerCommand.includes('sistemi diellor') || lowerCommand.includes('orbita')) {
        const params = { gravity: 50 };
        setSimulationType("orbital_motion");
        setSimulationParams(params);
        setInitialParams(params);
        setExplanation(t('overrides.space'));
        setIsRunning(true);
        setIsLoading(false);
        setTimeout(() => setShowExplanation(true), 1000);
        return;
      }

      if (lowerCommand.includes('black hole') || lowerCommand.includes('vrimë e zezë') || lowerCommand.includes('singularity') || lowerCommand.includes('event horizon')) {
        const params = { mass: 4.1, rotation: 1.2 };
        setSimulationType("black_hole");
        setSimulationParams(params);
        setInitialParams(params);
        setExplanation(t('overrides.blackHole'));
        setIsRunning(true);
        setIsLoading(false);
        setTimeout(() => setShowExplanation(true), 1000);
        return;
      }

      const { data, error } = await supabase.functions.invoke('simulate', {
        body: { command, language }
      });

      if (error) {
        console.error("Simulation error:", error);
        toast.error(t('common.error'));
        const params = { gravity: 9.8, color: "gray", size: 20, particleCount: 100 };
        setSimulationType("rock_fall");
        setSimulationParams(params);
        setInitialParams(params);
        setExplanation(t('overrides.gravity'));
        setIsRunning(true);
        setIsLoading(false);
        setTimeout(() => setShowExplanation(true), 1500);
        return;
      }
      else {
        console.log("AI response:", data);
        const params = data.parameters || {};
        setSimulationType(data.simulationType || "rock_fall");
        setSimulationParams(params);
        setInitialParams(params);
        setExplanation(data.explanation || "");
      }

      setIsRunning(true);
      setIsLoading(false);

      // Show explanation after a short delay
      setTimeout(() => {
        setShowExplanation(true);
      }, 1500);

    } catch (err) {
      console.error("Request error:", err);
      toast.error("Connection error. Using fallback simulation.");
      // Use fallback on error
      const params = { gravity: 9.8, color: "gray", size: 20, particleCount: 100 };
      setSimulationType("rock_fall");
      setSimulationParams(params);
      setInitialParams(params);
      setExplanation("A falling object accelerates due to gravity at 9.8 m/s². Upon impact, kinetic energy converts to other forms including sound, heat, and deformation.");
      setIsRunning(true);
      setIsLoading(false);
      setTimeout(() => setShowExplanation(true), 1500);
    }
  };

  const handleClear = () => {
    setIsRunning(false);
    setSimulationType("");
    setSimulationParams({});
    setInitialParams({});
    setExplanation("");
    setShowExplanation(false);
  };

  const handleParameterChange = useCallback((key: string, value: number) => {
    setSimulationParams(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleResetParameters = useCallback(() => {
    setSimulationParams(initialParams);
  }, [initialParams]);

  const handleExample = () => {
    handleRun(language === 'al' ? "vrimë e zezë" : "black hole");
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* GLSL Hills Background - Only render when NOT running a simulation to save WebGL contexts */}
      {!isRunning && (
        <div className="fixed inset-0 z-0 bg-[#050505]">
          <ErrorBoundary fallback={<div className="fixed inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#050505]" />}>
            <GLSLHills speed={0.3} cameraZ={150} />
          </ErrorBoundary>
        </div>
      )}

      {/* Gradient overlays */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <motion.section
          className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="text-center space-y-6 mb-8" variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-foreground">{t('hero.title1')}</span>{" "}
              <span className="text-primary text-glow">{t('hero.titleGlow')}</span>
              <br />
              <span className="text-foreground">{t('hero.title2')}</span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
          </motion.div>

          {/* Feature badges */}
          <motion.div className="flex flex-wrap justify-center gap-4 mb-8" variants={itemVariants}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/50 border border-border/50 text-sm text-muted-foreground">
              <Beaker className="w-4 h-4 text-primary" />
              <span>{t('hero.physicsBadge')}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/50 border border-border/50 text-sm text-muted-foreground">
              <Cpu className="w-4 h-4 text-secondary" />
              <span>{t('hero.aiBadge')}</span>
            </div>
          </motion.div>

          {/* Control Panel */}
          <motion.div className="w-full max-w-2xl mx-auto" variants={itemVariants}>
            <ControlPanel
              onRun={handleRun}
              onClear={handleClear}
              onExample={handleExample}
              isRunning={isRunning}
              isLoading={isLoading}
            />
          </motion.div>
        </motion.section>

        {/* Simulation Section */}
        <section className="px-4 pb-8">
          <motion.div
            className="max-w-5xl mx-auto space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Simulation Canvas Container */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              <ErrorBoundary>
                <SimulationCanvas3D
                  isRunning={isRunning}
                  simulationType={simulationType}
                  parameters={simulationParams}
                />

                {/* Overlay Controls */}
                <SimulationControls
                  simulationType={simulationType}
                  parameters={simulationParams}
                  onParameterChange={handleParameterChange}
                  onReset={handleResetParameters}
                  isVisible={isRunning && !!simulationType}
                />
              </ErrorBoundary>
            </div>

            {/* Explanation Panel */}
            <ExplanationPanel explanation={explanation} isVisible={showExplanation} />
          </motion.div>
        </section>

        {/* Sections */}
        <AboutSection />
        <ServicesSection />
        <FeaturesSection />
        <TestimonialsSection />
        <ContactSection />

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default Index;
