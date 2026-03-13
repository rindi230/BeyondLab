import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, RotateCcw } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";

interface ParameterConfig {
    key: string;
    label: string;
    min: number;
    max: number;
    step: number;
    unit?: string;
}

interface SimulationControlsProps {
    parameters: Record<string, any>;
    onParameterChange: (key: string, value: number) => void;
    onReset: () => void;
    isVisible: boolean;
    simulationType: string;
}

const PARAMETER_MAP: Record<string, ParameterConfig[]> = {
    pendulum: [
        { key: 'gravity', label: 'Gravity', min: 0, max: 20, step: 0.1, unit: 'm/s²' },
        { key: 'length', label: 'String Length', min: 1, max: 10, step: 0.5, unit: 'm' },
    ],
    projectile_motion: [
        { key: 'velocity', label: 'Initial Velocity', min: 10, max: 100, step: 1, unit: 'm/s' },
        { key: 'angle', label: 'Launch Angle', min: 0, max: 90, step: 1, unit: '°' },
        { key: 'gravity', label: 'Gravity', min: 0, max: 20, step: 0.1, unit: 'm/s²' },
    ],
    black_hole: [
        { key: 'mass', label: 'Mass', min: 1, max: 10, step: 0.1, unit: 'M☉ (x10⁶)' },
        { key: 'rotation', label: 'Rotation Speed', min: 0, max: 2, step: 0.1 },
    ],
    quantum_tunneling: [
        { key: 'intensity', label: 'Particle Probability', min: 0.5, max: 5, step: 0.1 },
        { key: 'velocity', label: 'Wave Speed', min: 0.5, max: 3, step: 0.1 },
    ],
    // Generic fallback
    default: [
        { key: 'intensity', label: 'Simulation Intensity', min: 0.5, max: 2, step: 0.1 },
        { key: 'speed', label: 'Time Scale', min: 0, max: 2, step: 0.1 },
    ]
};

export const SimulationControls: React.FC<SimulationControlsProps> = ({
    parameters,
    onParameterChange,
    onReset,
    isVisible,
    simulationType
}) => {
    const { t } = useLanguage();

    const type = simulationType.toLowerCase();
    const configs = PARAMETER_MAP[type] || PARAMETER_MAP.default;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute right-4 top-4 z-50 w-64 bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                            <Settings2 size={14} className="text-primary" />
                            <h3 className="text-[10px] uppercase tracking-widest text-white/60 font-medium">
                                {t('controls.parameters') || 'Parameters'}
                            </h3>
                        </div>
                        <button
                            onClick={onReset}
                            className="p-1 hover:bg-white/5 rounded-md transition-colors text-white/40 hover:text-white"
                            title="Reset to defaults"
                        >
                            <RotateCcw size={12} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {configs.map((config) => (
                            <div key={config.key} className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-white/40 font-medium uppercase tracking-tight">
                                        {config.label}
                                    </span>
                                    <span className="text-[11px] font-mono text-primary/80">
                                        {parameters[config.key]?.toFixed(1) || (config.min + (config.max - config.min) / 2).toFixed(1)}
                                        <span className="text-[9px] text-white/20 ml-1">{config.unit}</span>
                                    </span>
                                </div>
                                <Slider
                                    defaultValue={[parameters[config.key] || config.min + (config.max - config.min) / 2]}
                                    max={config.max}
                                    min={config.min}
                                    step={config.step}
                                    onValueChange={(vals) => onParameterChange(config.key, vals[0])}
                                    className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-primary [&_[role=slider]]:bg-background"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-3 border-t border-white/5">
                        <p className="text-[8px] text-white/20 italic text-center">
                            * Changes applied in real-time to the physical engine
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SimulationControls;
