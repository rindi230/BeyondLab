import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Clock, Info } from 'lucide-react';

export interface DataMetric {
    label: string;
    value: string | number;
    unit?: string;
    trend?: number[]; // For mini-sparkline
    icon?: 'activity' | 'zap' | 'clock' | 'info';
}

interface DataHUDProps {
    metrics: DataMetric[];
    title?: string;
    simulationType?: string;
}

const IconMap = {
    activity: <Activity size={14} className="text-blue-400" />,
    zap: <Zap size={14} className="text-yellow-400" />,
    clock: <Clock size={14} className="text-green-400" />,
    info: <Info size={14} className="text-purple-400" />,
};

const Sparkline = ({ data }: { data: number[] }) => {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 60;
    const height = 20;

    const points = data
        .map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={points}
                className="text-blue-500/50"
            />
        </svg>
    );
};

export const DataHUD: React.FC<DataHUDProps> = ({ metrics, title, simulationType }) => {
    return (
        <div className="absolute top-4 left-4 z-50 pointer-events-none select-none">
            <AnimatePresence mode="wait">
                <motion.div
                    key={simulationType}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl overflow-hidden"
                    style={{ width: '220px' }}
                >
                    {title && (
                        <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <h3 className="text-[10px] uppercase tracking-widest text-white/60 font-medium">
                                {title}
                            </h3>
                        </div>
                    )}

                    <div className="space-y-4">
                        {metrics.map((metric, idx) => (
                            <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-1.5">
                                        {metric.icon && IconMap[metric.icon]}
                                        <span className="text-[10px] text-white/40 font-medium uppercase tracking-tighter">
                                            {metric.label}
                                        </span>
                                    </div>
                                    {metric.trend && <Sparkline data={metric.trend} />}
                                </div>

                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-mono text-white/90 tabular-nums">
                                        {typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value}
                                    </span>
                                    {metric.unit && (
                                        <span className="text-[10px] text-white/30 font-light italic">
                                            {metric.unit}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5">
                        <div className="flex justify-between items-center text-[8px] text-white/20 uppercase tracking-widest">
                            <span>Scientific Core v2.4</span>
                            <span>Online</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default DataHUD;
