import { useEffect, useRef, useCallback } from "react";

interface SimulationParameters {
  gravity?: number;
  mass?: number;
  velocity?: number;
  particleCount?: number;
  color?: string;
  size?: number;
  duration?: number;
  elasticity?: number;
  intensity?: number;
}

interface SimulationCanvasProps {
  isRunning: boolean;
  simulationType: string;
  parameters?: SimulationParameters;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; 
  color: string; type: string; rotation?: number;
  opacity?: number; decay?: number; phase?: number;
  targetX?: number; targetY?: number; charge?: number;
  frequency?: number; amplitude?: number;
}

const colorPalettes: Record<string, string[]> = {
  fire: ["#FF4500", "#FF6B35", "#FF8C42", "#FFB347", "#FFCC00", "#FF2200"],
  water: ["#0077BE", "#1E90FF", "#00BFFF", "#87CEEB", "#4169E1", "#6495ED"],
  explosion: ["#FF4500", "#FF6600", "#FF8800", "#FFAA00", "#FFCC00", "#FFFFFF"],
  lightning: ["#FFFFFF", "#E0E0FF", "#C0C0FF", "#A0A0FF", "#8080FF"],
  smoke: ["#2F2F2F", "#3F3F3F", "#4F4F4F", "#5F5F5F", "#6F6F6F", "#7F7F7F"],
  dust: ["#8B7355", "#A0826D", "#BC9B85", "#D4B8A0", "#C4A882"],
  snow: ["#FFFFFF", "#F0F8FF", "#E8F4FF", "#DDEEFF", "#CCE5FF"],
  sparks: ["#FFFF00", "#FFD700", "#FFA500", "#FF4500", "#FFFFFF"],
  magic: ["#9400D3", "#8A2BE2", "#9932CC", "#BA55D3", "#DA70D6", "#FF00FF"],
  ice: ["#E0FFFF", "#B0E0E6", "#87CEEB", "#00CED1", "#40E0D0"],
  lava: ["#FF4500", "#FF6347", "#FF0000", "#DC143C", "#8B0000", "#FFD700"],
  electric: ["#00FFFF", "#00BFFF", "#1E90FF", "#FFFFFF", "#E0FFFF"],
  earth: ["#8B4513", "#A0522D", "#6B4423", "#CD853F", "#D2691E"],
  gray: ["#888888", "#666666", "#999999", "#AAAAAA", "#777777"],
  green: ["#00FF00", "#32CD32", "#228B22", "#90EE90", "#00FA9A"],
  purple: ["#9400D3", "#8B008B", "#9932CC", "#BA55D3", "#DA70D6"],
  orange: ["#FF6B35", "#FF8C42", "#FFB347", "#FFA500", "#FF7F00"],
  red: ["#FF0000", "#DC143C", "#B22222", "#FF4444", "#FF6666"],
  blue: ["#0000FF", "#1E90FF", "#4169E1", "#6495ED", "#87CEEB"],
  white: ["#FFFFFF", "#F5F5F5", "#EEEEEE", "#E0E0E0", "#D3D3D3"],
  yellow: ["#FFFF00", "#FFD700", "#FFC107", "#FFE135", "#F4D03F"],
  cyan: ["#00FFFF", "#00CED1", "#20B2AA", "#48D1CC", "#40E0D0"],
  pink: ["#FF69B4", "#FF1493", "#DB7093", "#FFB6C1", "#FFC0CB"],
  gold: ["#FFD700", "#FFC107", "#DAA520", "#B8860B", "#CD853F"],
  nuclear: ["#39FF14", "#00FF00", "#7FFF00", "#ADFF2F", "#00FF7F"],
  plasma: ["#FF00FF", "#FF69B4", "#00FFFF", "#FF1493", "#8A2BE2"],
  quantum: ["#00FFFF", "#FF00FF", "#8A2BE2", "#7B68EE", "#9370DB"],
  cosmic: ["#4B0082", "#8A2BE2", "#9400D3", "#FF00FF", "#00CED1"],
  acid: ["#39FF14", "#7FFF00", "#ADFF2F", "#CCFF00", "#DFFF00"],
  base: ["#4169E1", "#1E90FF", "#00BFFF", "#87CEEB", "#ADD8E6"],
  rainbow: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#8B00FF"],
  molecular: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"],
  dna: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3"],
  blood: ["#8B0000", "#B22222", "#DC143C", "#FF0000"],
  stellar: ["#FFD700", "#FFA500", "#FF4500", "#FF0000", "#8B0000"],
};

const SimulationCanvas = ({ isRunning, simulationType, parameters = {} }: SimulationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const stateRef = useRef<any>({});

  const getColors = useCallback((type: string, fallback: string = "gray") => {
    return colorPalettes[type] || colorPalettes[fallback] || colorPalettes.gray;
  }, []);

  const randomFromArray = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const createParticle = useCallback((
    x: number, y: number, type: string, colors: string[], options: Partial<Particle> = {}
  ): Particle => {
    const baseVelocity = parameters.velocity || 100;
    const angle = options.vx !== undefined ? 0 : Math.random() * Math.PI * 2;
    const speed = (Math.random() * baseVelocity * 0.05) + 2;
    
    return {
      x, y,
      vx: options.vx ?? Math.cos(angle) * speed,
      vy: options.vy ?? Math.sin(angle) * speed,
      life: 1,
      maxLife: options.maxLife ?? 1,
      size: options.size ?? Math.random() * 4 + 2,
      color: options.color ?? randomFromArray(colors),
      type,
      rotation: options.rotation ?? 0,
      opacity: options.opacity ?? 1,
      decay: options.decay ?? 0.015,
      phase: options.phase ?? 0,
      charge: options.charge ?? 0,
      frequency: options.frequency ?? 1,
      amplitude: options.amplitude ?? 1,
    };
  }, [parameters.velocity]);

  useEffect(() => {
    if (!isRunning || !simulationType) {
      particlesRef.current = [];
      stateRef.current = {};
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const groundY = height - 60;
    const gravity = (parameters.gravity || 9.8) * 0.3;
    const particleCount = parameters.particleCount || 150;
    const objectSize = parameters.size || 25;
    const duration = parameters.duration || 8;
    const intensity = parameters.intensity || 1;
    const centerX = width / 2;
    const centerY = height / 2;

    startTimeRef.current = Date.now();
    particlesRef.current = [];

    const simType = simulationType.toLowerCase();
    const state: any = { phase: "active", simType };

    // Initialize colors based on type
    if (simType.includes("nuclear") || simType.includes("fission") || simType.includes("fusion") || simType.includes("radioactive") || simType.includes("alpha") || simType.includes("beta") || simType.includes("gamma") || simType.includes("reactor")) {
      state.colors = getColors("nuclear");
    } else if (simType.includes("quantum") || simType.includes("tunnel") || simType.includes("superposition") || simType.includes("entangle") || simType.includes("uncertainty") || simType.includes("double_slit")) {
      state.colors = getColors("quantum");
    } else if (simType.includes("plasma") || simType.includes("tesla")) {
      state.colors = getColors("plasma");
    } else if (simType.includes("black_hole") || simType.includes("galaxy") || simType.includes("nebula") || simType.includes("cosmic") || simType.includes("quasar") || simType.includes("pulsar")) {
      state.colors = getColors("cosmic");
    } else if (simType.includes("acid")) {
      state.colors = getColors("acid");
    } else if (simType.includes("base") || simType.includes("neutralization")) {
      state.colors = getColors("base");
    } else if (simType.includes("rainbow") || simType.includes("prism") || simType.includes("spectrum")) {
      state.colors = getColors("rainbow");
    } else if (simType.includes("dna") || simType.includes("cell") || simType.includes("protein")) {
      state.colors = getColors("dna");
    } else if (simType.includes("blood") || simType.includes("vein") || simType.includes("artery")) {
      state.colors = getColors("blood");
    } else if (simType.includes("star") || simType.includes("supernova") || simType.includes("solar") || simType.includes("sun")) {
      state.colors = getColors("stellar");
    } else if (simType.includes("water") || simType.includes("flood") || simType.includes("wave") || simType.includes("ocean") || simType.includes("rain") || simType.includes("tsunami") || simType.includes("whirlpool")) {
      state.colors = getColors("water");
    } else if (simType.includes("fire") || simType.includes("burn") || simType.includes("flame") || simType.includes("combustion")) {
      state.colors = getColors("fire");
    } else if (simType.includes("explo") || simType.includes("bomb") || simType.includes("blast")) {
      state.colors = getColors("explosion");
    } else if (simType.includes("lightning") || simType.includes("thunder") || simType.includes("electric") || simType.includes("current")) {
      state.colors = getColors("electric");
    } else if (simType.includes("snow") || simType.includes("ice") || simType.includes("freez") || simType.includes("frost")) {
      state.colors = getColors("ice");
    } else if (simType.includes("lava") || simType.includes("volcano") || simType.includes("magma")) {
      state.colors = getColors("lava");
    } else if (simType.includes("magic") || simType.includes("portal") || simType.includes("spell")) {
      state.colors = getColors("magic");
    } else if (simType.includes("smoke") || simType.includes("fog") || simType.includes("steam")) {
      state.colors = getColors("smoke");
    } else if (simType.includes("molecular") || simType.includes("bond") || simType.includes("molecule") || simType.includes("reaction") || simType.includes("chemistry")) {
      state.colors = getColors("molecular");
    } else {
      state.colors = getColors(parameters.color || "gray");
    }

    stateRef.current = state;

    const drawGround = (shakeX = 0, shakeY = 0) => {
      const gY = groundY + shakeY;
      const gradient = ctx.createLinearGradient(0, gY, 0, height);
      gradient.addColorStop(0, "#3a3a3a");
      gradient.addColorStop(0.3, "#2a2a2a");
      gradient.addColorStop(1, "#1a1a1a");
      ctx.fillStyle = gradient;
      ctx.fillRect(shakeX, gY, width, height - gY + 20);
    };

    const drawAtom = (x: number, y: number, size: number, time: number) => {
      // Nucleus
      const nucleusGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.3);
      nucleusGradient.addColorStop(0, "#FF6B6B");
      nucleusGradient.addColorStop(0.5, "#EE5A5A");
      nucleusGradient.addColorStop(1, "#CC4444");
      ctx.fillStyle = nucleusGradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Electron orbits
      ctx.strokeStyle = "rgba(100, 200, 255, 0.5)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const orbitSize = size * (0.6 + i * 0.3);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(i * Math.PI / 3);
        ctx.scale(1, 0.4);
        ctx.beginPath();
        ctx.arc(0, 0, orbitSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        
        // Electron
        const electronAngle = time * 3 + i * 2;
        const ex = x + Math.cos(electronAngle) * orbitSize;
        const ey = y + Math.sin(electronAngle) * orbitSize * 0.4;
        ctx.fillStyle = "#00FFFF";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00FFFF";
        ctx.beginPath();
        ctx.arc(ex, ey, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const drawMolecule = (x: number, y: number, size: number, time: number) => {
      const bondLength = size * 1.2;
      const atoms = [
        { x: x, y: y, color: "#FF6B6B", r: size * 0.5 },
        { x: x + bondLength, y: y, color: "#4ECDC4", r: size * 0.4 },
        { x: x - bondLength * 0.8, y: y - bondLength * 0.6, color: "#45B7D1", r: size * 0.35 },
        { x: x - bondLength * 0.8, y: y + bondLength * 0.6, color: "#45B7D1", r: size * 0.35 },
      ];

      // Vibration
      atoms.forEach((a, i) => {
        a.x += Math.sin(time * 5 + i) * 2;
        a.y += Math.cos(time * 4 + i) * 2;
      });

      // Bonds
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(atoms[0].x, atoms[0].y);
      ctx.lineTo(atoms[1].x, atoms[1].y);
      ctx.moveTo(atoms[0].x, atoms[0].y);
      ctx.lineTo(atoms[2].x, atoms[2].y);
      ctx.moveTo(atoms[0].x, atoms[0].y);
      ctx.lineTo(atoms[3].x, atoms[3].y);
      ctx.stroke();

      // Atoms
      atoms.forEach(a => {
        const grad = ctx.createRadialGradient(a.x - a.r * 0.3, a.y - a.r * 0.3, 0, a.x, a.y, a.r);
        grad.addColorStop(0, "#FFF");
        grad.addColorStop(0.3, a.color);
        grad.addColorStop(1, a.color);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawWave = (y: number, time: number, color: string, amplitude: number = 30, frequency: number = 0.02) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 5) {
        const wy = y + Math.sin((x * frequency) + time * 3) * amplitude;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    };

    const drawLightningBolt = (startX: number, startY: number, endY: number) => {
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 4;
      ctx.shadowBlur = 30;
      ctx.shadowColor = "#00BFFF";
      
      ctx.beginPath();
      let x = startX;
      ctx.moveTo(x, startY);
      
      for (let y = startY; y < endY; y += 25) {
        x += (Math.random() - 0.5) * 60;
        ctx.lineTo(x, y);
        
        if (Math.random() > 0.7) {
          ctx.moveTo(x, y);
          const branchX = x + (Math.random() - 0.5) * 80;
          const branchY = y + 40 + Math.random() * 30;
          ctx.lineTo(branchX, branchY);
          ctx.moveTo(x, y);
        }
      }
      ctx.lineTo(x, endY);
      ctx.stroke();
      
      ctx.strokeStyle = "rgba(200, 220, 255, 0.5)";
      ctx.lineWidth = 12;
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      return x;
    };

    const drawOrbit = (cx: number, cy: number, rx: number, ry: number, angle: number, planetSize: number, planetColor: string) => {
      // Orbit path
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Planet
      const px = cx + Math.cos(angle) * rx;
      const py = cy + Math.sin(angle) * ry;
      const grad = ctx.createRadialGradient(px - planetSize * 0.3, py - planetSize * 0.3, 0, px, py, planetSize);
      grad.addColorStop(0, "#FFF");
      grad.addColorStop(0.5, planetColor);
      grad.addColorStop(1, planetColor);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, planetSize, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawBlackHole = (x: number, y: number, size: number, time: number) => {
      // Accretion disk
      for (let i = 0; i < 5; i++) {
        const diskSize = size * (1.5 + i * 0.3);
        const gradient = ctx.createRadialGradient(x, y, size, x, y, diskSize);
        gradient.addColorStop(0, `rgba(255, 150, 50, ${0.3 - i * 0.05})`);
        gradient.addColorStop(0.5, `rgba(255, 100, 0, ${0.2 - i * 0.03})`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * 0.5 + i * 0.2);
        ctx.scale(1, 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, diskSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Event horizon
      const eventGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      eventGradient.addColorStop(0, "#000000");
      eventGradient.addColorStop(0.7, "#000000");
      eventGradient.addColorStop(1, "rgba(50, 0, 100, 0.8)");
      ctx.fillStyle = eventGradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Gravitational lensing effect
      ctx.strokeStyle = "rgba(100, 50, 200, 0.3)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (time * 0.3 + i * Math.PI / 4) % (Math.PI * 2);
        ctx.beginPath();
        ctx.arc(x, y, size * 1.1, angle, angle + 0.5);
        ctx.stroke();
      }
    };

    const drawDNA = (x: number, y: number, time: number) => {
      const helixWidth = 60;
      const segmentHeight = 15;
      const segments = 20;

      for (let i = 0; i < segments; i++) {
        const yPos = y - 150 + i * segmentHeight;
        const phase = time * 2 + i * 0.5;
        const x1 = x + Math.sin(phase) * helixWidth;
        const x2 = x + Math.sin(phase + Math.PI) * helixWidth;

        // Backbone
        ctx.fillStyle = "#FF6B6B";
        ctx.beginPath();
        ctx.arc(x1, yPos, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#4ECDC4";
        ctx.beginPath();
        ctx.arc(x2, yPos, 6, 0, Math.PI * 2);
        ctx.fill();

        // Base pairs
        if (i % 2 === 0) {
          ctx.strokeStyle = i % 4 === 0 ? "#FFE66D" : "#95E1D3";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(x1, yPos);
          ctx.lineTo(x2, yPos);
          ctx.stroke();
        }
      }
    };

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const state = stateRef.current;
      
      // Clear with motion blur for some effects
      if (state.simType.includes("tornado") || state.simType.includes("earthquake") || state.simType.includes("quantum")) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      // === NUCLEAR FISSION ===
      if (state.simType.includes("fission") || (state.simType.includes("nuclear") && !state.simType.includes("fusion"))) {
        // Dark background
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, width, height);
        
        if (!state.split && elapsed > 1) {
          state.split = true;
          // Release neutrons and fragments
          for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 10;
            particlesRef.current.push(createParticle(
              centerX, centerY, "neutron", ["#39FF14", "#00FF00"],
              { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: 4, maxLife: 1.5, decay: 0.01 }
            ));
          }
          // Energy flash
          for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 8 + Math.random() * 15;
            particlesRef.current.push(createParticle(
              centerX, centerY, "energy", ["#FFFFFF", "#FFFF00", "#00FFFF"],
              { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: 3, maxLife: 0.8, decay: 0.02 }
            ));
          }
        }

        if (!state.split) {
          // Pulsing atom before split
          const pulse = 1 + Math.sin(elapsed * 10) * 0.1;
          drawAtom(centerX, centerY, 40 * pulse * intensity, elapsed);
        } else {
          // Split fragments moving apart
          const sep = Math.min((elapsed - 1) * 80, 150);
          drawAtom(centerX - sep, centerY, 25, elapsed);
          drawAtom(centerX + sep, centerY, 25, elapsed);
        }

        // Flash effect
        if (state.split && elapsed < 1.3) {
          const flash = 1 - (elapsed - 1) / 0.3;
          ctx.fillStyle = `rgba(255, 255, 200, ${flash * 0.5})`;
          ctx.fillRect(0, 0, width, height);
        }
      }
      // === NUCLEAR FUSION ===
      else if (state.simType.includes("fusion")) {
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, width, height);
        
        const approach = Math.max(0, 100 - elapsed * 50);
        
        if (approach > 10) {
          // Two atoms approaching
          drawAtom(centerX - approach, centerY, 30, elapsed);
          drawAtom(centerX + approach, centerY, 30, elapsed);
        } else if (!state.fused) {
          state.fused = true;
          // Fusion burst
          for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 10 + Math.random() * 20;
            particlesRef.current.push(createParticle(
              centerX, centerY, "plasma", ["#FFFFFF", "#FFFF00", "#FF8800", "#00FFFF"],
              { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: 6, maxLife: 1.2, decay: 0.015 }
            ));
          }
        }

        if (state.fused) {
          // Resulting larger atom
          drawAtom(centerX, centerY, 50, elapsed);
          // Continuous energy emission
          if (Math.random() > 0.5) {
            const angle = Math.random() * Math.PI * 2;
            particlesRef.current.push(createParticle(
              centerX, centerY, "energy", ["#FFFF00", "#FFA500"],
              { vx: Math.cos(angle) * 4, vy: Math.sin(angle) * 4, size: 3, maxLife: 0.8, decay: 0.02 }
            ));
          }
        }

        // Intense flash
        if (state.fused && elapsed < 2.5) {
          const flash = Math.max(0, 1 - (elapsed - 2) / 0.5);
          ctx.fillStyle = `rgba(255, 255, 255, ${flash * 0.6})`;
          ctx.fillRect(0, 0, width, height);
        }
      }
      // === RADIOACTIVE DECAY / ALPHA / BETA / GAMMA ===
      else if (state.simType.includes("radioactive") || state.simType.includes("decay") || state.simType.includes("alpha") || state.simType.includes("beta") || state.simType.includes("gamma") || state.simType.includes("half_life")) {
        ctx.fillStyle = "#0a0a15";
        ctx.fillRect(0, 0, width, height);
        
        drawAtom(centerX, centerY, 40, elapsed);
        
        // Emit particles periodically
        if (Math.random() > 0.92) {
          const angle = Math.random() * Math.PI * 2;
          const type = state.simType.includes("alpha") ? "alpha" : state.simType.includes("beta") ? "beta" : "gamma";
          const speed = type === "gamma" ? 20 : type === "alpha" ? 8 : 12;
          const color = type === "alpha" ? "#FFFF00" : type === "beta" ? "#00FFFF" : "#FF00FF";
          
          particlesRef.current.push(createParticle(
            centerX, centerY, type, [color],
            { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: type === "alpha" ? 6 : 3, maxLife: 1.5, decay: 0.012 }
          ));
        }

        // Radiation warning glow
        const pulseGlow = 0.3 + Math.sin(elapsed * 4) * 0.1;
        const glowGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
        glowGrad.addColorStop(0, `rgba(57, 255, 20, ${pulseGlow})`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, width, height);
      }
      // === QUANTUM TUNNELING ===
      else if (state.simType.includes("tunnel") || state.simType.includes("quantum_tunnel")) {
        ctx.fillStyle = "#050510";
        ctx.fillRect(0, 0, width, height);
        
        // Barrier
        const barrierX = centerX;
        const barrierGrad = ctx.createLinearGradient(barrierX - 20, 0, barrierX + 20, 0);
        barrierGrad.addColorStop(0, "rgba(100, 100, 200, 0.3)");
        barrierGrad.addColorStop(0.5, "rgba(150, 150, 255, 0.6)");
        barrierGrad.addColorStop(1, "rgba(100, 100, 200, 0.3)");
        ctx.fillStyle = barrierGrad;
        ctx.fillRect(barrierX - 20, 50, 40, height - 100);

        // Particle wave function
        const particleX = 100 + (elapsed * 80) % (width + 100);
        const waveAmplitude = 30;
        
        // Wave packet
        for (let i = -50; i < 50; i += 5) {
          const x = particleX + i;
          const envelope = Math.exp(-(i * i) / 500);
          const wave = Math.sin(i * 0.2 + elapsed * 10) * envelope * waveAmplitude;
          
          ctx.fillStyle = `rgba(0, 255, 255, ${envelope})`;
          ctx.beginPath();
          ctx.arc(x, centerY + wave, 4 * envelope, 0, Math.PI * 2);
          ctx.fill();
        }

        // Tunneled probability cloud on other side
        if (particleX > barrierX) {
          ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
          ctx.beginPath();
          ctx.arc(particleX + 50, centerY, 20, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // === DOUBLE SLIT ===
      else if (state.simType.includes("double_slit") || state.simType.includes("slit")) {
        ctx.fillStyle = "#050510";
        ctx.fillRect(0, 0, width, height);
        
        // Barrier with slits
        ctx.fillStyle = "#333";
        ctx.fillRect(centerX - 10, 0, 20, centerY - 40);
        ctx.fillRect(centerX - 10, centerY - 20, 20, 40);
        ctx.fillRect(centerX - 10, centerY + 20, 20, height);

        // Incoming wave
        for (let i = 0; i < 5; i++) {
          const x = 50 + ((elapsed * 50 + i * 30) % (centerX - 30));
          ctx.strokeStyle = `rgba(0, 200, 255, ${0.5 - i * 0.1})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, 50);
          ctx.lineTo(x, height - 50);
          ctx.stroke();
        }

        // Interference pattern on screen
        const screenX = width - 50;
        for (let y = 50; y < height - 50; y += 3) {
          const d1 = Math.sqrt((screenX - centerX) ** 2 + (y - (centerY - 30)) ** 2);
          const d2 = Math.sqrt((screenX - centerX) ** 2 + (y - (centerY + 30)) ** 2);
          const interference = Math.cos((d1 - d2) * 0.1 + elapsed * 5);
          const brightness = (interference + 1) / 2;
          
          ctx.fillStyle = `rgba(0, 255, 255, ${brightness * 0.8})`;
          ctx.fillRect(screenX - 5, y, 10, 3);
        }

        // Particles through slits
        if (Math.random() > 0.7) {
          const slitY = Math.random() > 0.5 ? centerY - 30 : centerY + 30;
          particlesRef.current.push(createParticle(
            centerX + 15, slitY, "photon", ["#00FFFF"],
            { vx: 6, vy: (Math.random() - 0.5) * 3, size: 3, maxLife: 1, decay: 0.015 }
          ));
        }
      }
      // === WAVE INTERFERENCE ===
      else if (state.simType.includes("wave_interference") || state.simType.includes("interference")) {
        ctx.fillStyle = "#050510";
        ctx.fillRect(0, 0, width, height);
        
        // Two wave sources
        const source1 = { x: width * 0.3, y: centerY };
        const source2 = { x: width * 0.7, y: centerY };
        
        // Draw interference pattern
        for (let x = 0; x < width; x += 8) {
          for (let y = 0; y < height; y += 8) {
            const d1 = Math.sqrt((x - source1.x) ** 2 + (y - source1.y) ** 2);
            const d2 = Math.sqrt((x - source2.x) ** 2 + (y - source2.y) ** 2);
            const wave1 = Math.sin(d1 * 0.05 - elapsed * 5);
            const wave2 = Math.sin(d2 * 0.05 - elapsed * 5);
            const combined = (wave1 + wave2) / 2;
            const brightness = (combined + 1) / 2;
            
            ctx.fillStyle = `rgba(100, 200, 255, ${brightness * 0.6})`;
            ctx.fillRect(x, y, 8, 8);
          }
        }

        // Wave sources
        ctx.fillStyle = "#FFF";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#00FFFF";
        ctx.beginPath();
        ctx.arc(source1.x, source1.y, 10, 0, Math.PI * 2);
        ctx.arc(source2.x, source2.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // === MAGNETIC FIELD ===
      else if (state.simType.includes("magnetic") || state.simType.includes("magnet")) {
        drawGround();
        
        // Bar magnet
        ctx.fillStyle = "#CC0000";
        ctx.fillRect(centerX - 80, centerY - 20, 80, 40);
        ctx.fillStyle = "#0000CC";
        ctx.fillRect(centerX, centerY - 20, 80, 40);
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("N", centerX - 40, centerY + 7);
        ctx.fillText("S", centerX + 40, centerY + 7);

        // Field lines
        for (let i = 0; i < 8; i++) {
          const startY = centerY - 50 + i * 15;
          ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          
          for (let t = 0; t <= 1; t += 0.02) {
            const angle = t * Math.PI;
            const x = centerX + Math.cos(angle) * 120;
            const y = startY + Math.sin(angle) * (40 + i * 5);
            if (t === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Iron filings (particles)
        if (Math.random() > 0.7) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 80 + Math.random() * 100;
          particlesRef.current.push(createParticle(
            centerX + Math.cos(angle) * dist,
            centerY + Math.sin(angle) * dist * 0.5,
            "filing", ["#888", "#666", "#AAA"],
            { vx: 0, vy: 0, size: 2, maxLife: 2, decay: 0.008, rotation: angle }
          ));
        }
      }
      // === ELECTRIC FIELD / CURRENT ===
      else if (state.simType.includes("electric_field") || state.simType.includes("electric_current") || state.simType.includes("current")) {
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, width, height);
        
        // Positive and negative charges
        const posX = centerX - 100;
        const negX = centerX + 100;
        
        // Positive charge
        const posGrad = ctx.createRadialGradient(posX, centerY, 0, posX, centerY, 30);
        posGrad.addColorStop(0, "#FF4444");
        posGrad.addColorStop(1, "#880000");
        ctx.fillStyle = posGrad;
        ctx.beginPath();
        ctx.arc(posX, centerY, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("+", posX, centerY + 8);

        // Negative charge
        const negGrad = ctx.createRadialGradient(negX, centerY, 0, negX, centerY, 30);
        negGrad.addColorStop(0, "#4444FF");
        negGrad.addColorStop(1, "#000088");
        ctx.fillStyle = negGrad;
        ctx.beginPath();
        ctx.arc(negX, centerY, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFF";
        ctx.fillText("−", negX, centerY + 8);

        // Field lines / electron flow
        for (let i = 0; i < 7; i++) {
          const startY = centerY - 60 + i * 20;
          ctx.strokeStyle = "rgba(255, 255, 100, 0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(posX + 30, startY);
          ctx.bezierCurveTo(centerX, startY - 20, centerX, startY + 20, negX - 30, startY);
          ctx.stroke();
        }

        // Flowing electrons
        if (Math.random() > 0.6) {
          const lineY = centerY - 60 + Math.floor(Math.random() * 7) * 20;
          particlesRef.current.push(createParticle(
            posX + 30, lineY, "electron", ["#00FFFF", "#88FFFF"],
            { vx: 5, vy: 0, size: 4, maxLife: 1.2, decay: 0.012 }
          ));
        }
      }
      // === BLACK HOLE ===
      else if (state.simType.includes("black_hole")) {
        ctx.fillStyle = "#000005";
        ctx.fillRect(0, 0, width, height);
        
        // Stars background
        for (let i = 0; i < 50; i++) {
          const sx = (i * 73) % width;
          const sy = (i * 47) % height;
          ctx.fillStyle = "#FFF";
          ctx.beginPath();
          ctx.arc(sx, sy, 1, 0, Math.PI * 2);
          ctx.fill();
        }

        drawBlackHole(centerX, centerY, 50 * intensity, elapsed);

        // Matter being pulled in
        if (Math.random() > 0.6) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 180 + Math.random() * 50;
          particlesRef.current.push(createParticle(
            centerX + Math.cos(angle) * dist,
            centerY + Math.sin(angle) * dist,
            "matter", ["#FFD700", "#FFA500", "#FF4500"],
            { vx: 0, vy: 0, size: 3, maxLife: 2, decay: 0.008, targetX: centerX, targetY: centerY }
          ));
        }
      }
      // === SUPERNOVA ===
      else if (state.simType.includes("supernova")) {
        ctx.fillStyle = "#000005";
        ctx.fillRect(0, 0, width, height);
        
        if (elapsed < 1.5) {
          // Collapsing star
          const collapseSize = 60 - elapsed * 30;
          const starGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, collapseSize);
          starGrad.addColorStop(0, "#FFFFFF");
          starGrad.addColorStop(0.5, "#FFD700");
          starGrad.addColorStop(1, "#FF4500");
          ctx.fillStyle = starGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, Math.max(10, collapseSize), 0, Math.PI * 2);
          ctx.fill();
        } else if (!state.exploded) {
          state.exploded = true;
          // Massive explosion
          for (let i = 0; i < 300; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 20;
            const colors = ["#FFFFFF", "#FFD700", "#FF4500", "#FF0000", "#00FFFF", "#FF00FF"];
            particlesRef.current.push(createParticle(
              centerX, centerY, "star_matter", colors,
              { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: 3 + Math.random() * 8, maxLife: 2, decay: 0.008 }
            ));
          }
        }

        // Flash
        if (state.exploded && elapsed < 2) {
          const flash = 1 - (elapsed - 1.5) / 0.5;
          ctx.fillStyle = `rgba(255, 255, 255, ${flash})`;
          ctx.fillRect(0, 0, width, height);
        }

        // Remnant core
        if (state.exploded && elapsed > 2.5) {
          const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
          coreGrad.addColorStop(0, "#00FFFF");
          coreGrad.addColorStop(1, "#0000FF");
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // === ORBITAL MOTION ===
      else if (state.simType.includes("orbital") || state.simType.includes("orbit") || state.simType.includes("planet") || state.simType.includes("satellite")) {
        ctx.fillStyle = "#000010";
        ctx.fillRect(0, 0, width, height);
        
        // Sun/central body
        const sunGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
        sunGrad.addColorStop(0, "#FFFFFF");
        sunGrad.addColorStop(0.5, "#FFD700");
        sunGrad.addColorStop(1, "#FF8C00");
        ctx.fillStyle = sunGrad;
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#FF8C00";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Planets
        drawOrbit(centerX, centerY, 80, 60, elapsed * 2, 10, "#4169E1");
        drawOrbit(centerX, centerY, 130, 100, elapsed * 1.3, 15, "#CD853F");
        drawOrbit(centerX, centerY, 180, 140, elapsed * 0.8, 12, "#32CD32");
      }
      // === MOON ORBITING EARTH ===
      else if (state.simType.includes("moon_orbit") || state.simType.includes("moon")) {
        ctx.fillStyle = "#000010";
        ctx.fillRect(0, 0, width, height);
        
        // Stars
        for (let i = 0; i < 80; i++) {
          ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
          ctx.beginPath();
          ctx.arc((i * 97) % width, (i * 53) % height, 1, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Earth
        const earthGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 45);
        earthGrad.addColorStop(0, "#4169E1");
        earthGrad.addColorStop(0.5, "#1E90FF");
        earthGrad.addColorStop(0.8, "#228B22");
        earthGrad.addColorStop(1, "#006400");
        ctx.fillStyle = earthGrad;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#4169E1";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Moon orbit path
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 120, 100, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Moon
        const moonAngle = elapsed * 0.5;
        const moonX = centerX + Math.cos(moonAngle) * 120;
        const moonY = centerY + Math.sin(moonAngle) * 100;
        const moonGrad = ctx.createRadialGradient(moonX - 3, moonY - 3, 0, moonX, moonY, 15);
        moonGrad.addColorStop(0, "#FFFFFF");
        moonGrad.addColorStop(0.5, "#C0C0C0");
        moonGrad.addColorStop(1, "#808080");
        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Labels
        ctx.fillStyle = "#FFF";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Earth", centerX, centerY + 65);
        ctx.fillText("Moon", moonX, moonY + 25);
        ctx.fillText(`T = 27.3 days (scaled)`, centerX, height - 30);
      }
      // === GRAVITY COMPARISON (Different planets) ===
      else if (state.simType.includes("gravity_comparison") || state.simType.includes("weight_vs_mass")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        const planets = [
          { name: "Moon", g: 1.62, color: "#C0C0C0" },
          { name: "Earth", g: 9.8, color: "#4169E1" },
          { name: "Mars", g: 3.7, color: "#CD853F" },
          { name: "Jupiter", g: 24.8, color: "#DEB887" }
        ];
        
        const colWidth = width / planets.length;
        
        planets.forEach((planet, i) => {
          const px = colWidth * i + colWidth / 2;
          const groundLevel = height - 80;
          
          // Column divider
          if (i > 0) {
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.beginPath();
            ctx.moveTo(colWidth * i, 0);
            ctx.lineTo(colWidth * i, height);
            ctx.stroke();
          }
          
          // Planet label
          ctx.fillStyle = planet.color;
          ctx.font = "bold 16px Arial";
          ctx.textAlign = "center";
          ctx.fillText(planet.name, px, 30);
          ctx.fillStyle = "#AAA";
          ctx.font = "12px Arial";
          ctx.fillText(`g = ${planet.g} m/s²`, px, 50);
          
          // Ground
          ctx.fillStyle = "#333";
          ctx.fillRect(colWidth * i + 10, groundLevel, colWidth - 20, 40);
          
          // Falling object (scaled by gravity)
          const fallSpeed = planet.g * 0.08;
          if (!state[`ball_${i}`]) {
            state[`ball_${i}`] = { y: 80, vy: 0 };
          }
          state[`ball_${i}`].vy += fallSpeed * 0.1;
          state[`ball_${i}`].y += state[`ball_${i}`].vy;
          
          if (state[`ball_${i}`].y > groundLevel - 20) {
            state[`ball_${i}`].y = groundLevel - 20;
            state[`ball_${i}`].vy *= -0.5;
          }
          
          const ballGrad = ctx.createRadialGradient(px, state[`ball_${i}`].y, 0, px, state[`ball_${i}`].y, 18);
          ballGrad.addColorStop(0, "#FFF");
          ballGrad.addColorStop(1, planet.color);
          ctx.fillStyle = ballGrad;
          ctx.beginPath();
          ctx.arc(px, state[`ball_${i}`].y, 18, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      // === NEWTON'S CRADLE ===
      else if (state.simType.includes("newton_cradle") || state.simType.includes("cradle")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        // Frame
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 4;
        ctx.strokeRect(centerX - 150, 50, 300, 20);
        
        const numBalls = 5;
        const ballRadius = 20;
        const stringLength = 150;
        const spacing = 42;
        
        if (!state.cradleBalls) {
          state.cradleBalls = [];
          for (let i = 0; i < numBalls; i++) {
            state.cradleBalls.push({ angle: i === 0 ? Math.PI / 4 : 0, velocity: 0 });
          }
        }
        
        // Physics for outer balls
        const dampening = 0.999;
        const gravityEffect = 0.001;
        
        // Left ball
        state.cradleBalls[0].velocity += -gravityEffect * Math.sin(state.cradleBalls[0].angle);
        state.cradleBalls[0].velocity *= dampening;
        state.cradleBalls[0].angle += state.cradleBalls[0].velocity;
        
        // Transfer momentum
        if (state.cradleBalls[0].angle <= 0 && state.cradleBalls[0].velocity < 0) {
          state.cradleBalls[numBalls - 1].velocity = -state.cradleBalls[0].velocity * 0.98;
          state.cradleBalls[0].velocity = 0;
          state.cradleBalls[0].angle = 0;
        }
        
        // Right ball
        state.cradleBalls[numBalls - 1].velocity += -gravityEffect * Math.sin(state.cradleBalls[numBalls - 1].angle);
        state.cradleBalls[numBalls - 1].velocity *= dampening;
        state.cradleBalls[numBalls - 1].angle += state.cradleBalls[numBalls - 1].velocity;
        
        if (state.cradleBalls[numBalls - 1].angle >= 0 && state.cradleBalls[numBalls - 1].velocity > 0) {
          state.cradleBalls[0].velocity = -state.cradleBalls[numBalls - 1].velocity * 0.98;
          state.cradleBalls[numBalls - 1].velocity = 0;
          state.cradleBalls[numBalls - 1].angle = 0;
        }
        
        // Draw balls
        for (let i = 0; i < numBalls; i++) {
          const anchorX = centerX - (numBalls / 2 - 0.5) * spacing + i * spacing;
          const anchorY = 70;
          const ball = state.cradleBalls[i];
          const ballX = anchorX + Math.sin(ball.angle) * stringLength;
          const ballY = anchorY + Math.cos(ball.angle) * stringLength;
          
          // String
          ctx.strokeStyle = "#888";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(anchorX, anchorY);
          ctx.lineTo(ballX, ballY);
          ctx.stroke();
          
          // Ball
          const ballGrad = ctx.createRadialGradient(ballX - 5, ballY - 5, 0, ballX, ballY, ballRadius);
          ballGrad.addColorStop(0, "#FFF");
          ballGrad.addColorStop(0.5, "#C0C0C0");
          ballGrad.addColorStop(1, "#808080");
          ctx.fillStyle = ballGrad;
          ctx.beginPath();
          ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.fillStyle = "#AAA";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Conservation of Momentum: p = mv", centerX, height - 30);
      }
      // === KINETIC ENERGY DEMO ===
      else if (state.simType.includes("kinetic_energy") || state.simType.includes("kinetic")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        // Two balls with different velocities
        if (!state.keBalls) {
          state.keBalls = [
            { x: 100, v: 3, m: 1, color: "#FF6B6B" },
            { x: 100, v: 6, m: 1, color: "#4ECDC4" }
          ];
        }
        
        state.keBalls.forEach((ball: any, i: number) => {
          const y = height / 3 + i * (height / 3);
          ball.x += ball.v;
          if (ball.x > width - 30) ball.x = 100;
          
          // Track line
          ctx.strokeStyle = "rgba(255,255,255,0.2)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(50, y);
          ctx.lineTo(width - 50, y);
          ctx.stroke();
          
          // Ball
          const grad = ctx.createRadialGradient(ball.x, y, 0, ball.x, y, 25);
          grad.addColorStop(0, "#FFF");
          grad.addColorStop(1, ball.color);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(ball.x, y, 25, 0, Math.PI * 2);
          ctx.fill();
          
          // KE calculation
          const ke = 0.5 * ball.m * ball.v * ball.v;
          ctx.fillStyle = "#FFF";
          ctx.font = "14px Arial";
          ctx.textAlign = "left";
          ctx.fillText(`v = ${ball.v} m/s`, 60, y - 40);
          ctx.fillText(`KE = ½mv² = ${ke.toFixed(1)} J`, 60, y - 20);
          
          // Velocity arrow
          ctx.strokeStyle = ball.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(ball.x + 30, y);
          ctx.lineTo(ball.x + 30 + ball.v * 10, y);
          ctx.stroke();
        });
        
        ctx.fillStyle = "#FFD700";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("KE = ½mv² (Kinetic Energy)", centerX, 40);
      }
      // === POTENTIAL ENERGY DEMO ===
      else if (state.simType.includes("potential_energy") || state.simType.includes("conservation_energy")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        // Roller coaster track
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(50, 100);
        ctx.bezierCurveTo(150, 100, 200, height - 100, 300, height - 100);
        ctx.bezierCurveTo(400, height - 100, 450, 200, 550, 200);
        ctx.bezierCurveTo(650, 200, 700, height - 80, width - 50, height - 80);
        ctx.stroke();
        
        if (!state.peCart) {
          state.peCart = { t: 0 };
        }
        state.peCart.t = (state.peCart.t + 0.005) % 1;
        
        // Calculate position on curve
        const t = state.peCart.t;
        const cartX = 50 + t * (width - 100);
        let cartY;
        if (t < 0.33) {
          const localT = t / 0.33;
          cartY = 100 + (height - 200) * localT;
        } else if (t < 0.66) {
          const localT = (t - 0.33) / 0.33;
          cartY = height - 100 - (height - 300) * localT;
        } else {
          const localT = (t - 0.66) / 0.34;
          cartY = 200 + (height - 280) * localT;
        }
        
        // Cart
        ctx.fillStyle = "#FF6B6B";
        ctx.fillRect(cartX - 15, cartY - 20, 30, 15);
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(cartX - 8, cartY, 5, 0, Math.PI * 2);
        ctx.arc(cartX + 8, cartY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Energy bars
        const maxHeight = height - 100;
        const pe = (height - cartY) / maxHeight;
        const ke = 1 - pe;
        
        ctx.fillStyle = "#4169E1";
        ctx.fillRect(width - 80, 80, 25, pe * 150);
        ctx.fillStyle = "#FF4500";
        ctx.fillRect(width - 45, 80 + pe * 150, 25, ke * 150);
        
        ctx.fillStyle = "#FFF";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PE", width - 67, 70);
        ctx.fillText("KE", width - 32, 70);
        ctx.fillText("PE + KE = constant", centerX, 40);
      }
      // === PARABOLIC MOTION (with vectors) ===
      else if (state.simType.includes("parabolic") || state.simType.includes("projectile")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        drawGround();
        
        if (!state.projectile) {
          state.projectile = { x: 80, y: groundY - 20, vx: 8, vy: -12, trail: [] };
        }
        
        // Physics
        state.projectile.vy += gravity * 0.08;
        state.projectile.x += state.projectile.vx;
        state.projectile.y += state.projectile.vy;
        
        // Trail
        state.projectile.trail.push({ x: state.projectile.x, y: state.projectile.y });
        if (state.projectile.trail.length > 50) state.projectile.trail.shift();
        
        // Reset if hit ground
        if (state.projectile.y > groundY - 10) {
          state.projectile = { x: 80, y: groundY - 20, vx: 8, vy: -12, trail: [] };
        }
        
        // Draw trail
        ctx.strokeStyle = "rgba(255,200,100,0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        state.projectile.trail.forEach((p: any, i: number) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        
        // Projectile
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(state.projectile.x, state.projectile.y, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Velocity vectors
        const scale = 3;
        // Vx (horizontal)
        ctx.strokeStyle = "#4ECDC4";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(state.projectile.x, state.projectile.y);
        ctx.lineTo(state.projectile.x + state.projectile.vx * scale, state.projectile.y);
        ctx.stroke();
        
        // Vy (vertical)
        ctx.strokeStyle = "#FF6B6B";
        ctx.beginPath();
        ctx.moveTo(state.projectile.x, state.projectile.y);
        ctx.lineTo(state.projectile.x, state.projectile.y + state.projectile.vy * scale);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = "#4ECDC4";
        ctx.font = "12px Arial";
        ctx.fillText("Vx", state.projectile.x + state.projectile.vx * scale + 10, state.projectile.y);
        ctx.fillStyle = "#FF6B6B";
        ctx.fillText("Vy", state.projectile.x + 10, state.projectile.y + state.projectile.vy * scale);
        
        ctx.fillStyle = "#FFF";
        ctx.textAlign = "center";
        ctx.fillText("y = v₀t - ½gt² (Projectile Motion)", centerX, 30);
      }
      // === SIMPLE HARMONIC MOTION ===
      else if (state.simType.includes("simple_harmonic")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        const amplitude = 100;
        const omega = 3;
        const x = centerX + Math.sin(elapsed * omega) * amplitude;
        
        // Equilibrium line
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 50);
        ctx.lineTo(centerX, centerY + 50);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Track
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - amplitude - 30, centerY);
        ctx.lineTo(centerX + amplitude + 30, centerY);
        ctx.stroke();
        
        // Mass
        const grad = ctx.createRadialGradient(x, centerY, 0, x, centerY, 25);
        grad.addColorStop(0, "#FFF");
        grad.addColorStop(1, "#4ECDC4");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, centerY, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Sine wave graph below
        ctx.strokeStyle = "#4ECDC4";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let t = 0; t < width; t += 3) {
          const graphY = centerY + 120 + Math.sin((t * 0.02 - elapsed) * omega) * 40;
          if (t === 0) ctx.moveTo(t, graphY);
          else ctx.lineTo(t, graphY);
        }
        ctx.stroke();
        
        ctx.fillStyle = "#FFF";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("x(t) = A·sin(ωt) Simple Harmonic Motion", centerX, 40);
        ctx.fillText(`A = ${amplitude}px, ω = ${omega} rad/s`, centerX, 60);
      }
      // === CIRCULAR MOTION ===
      else if (state.simType.includes("circular_motion") || state.simType.includes("centripetal")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        const radius = 100;
        const omega = 2;
        const angle = elapsed * omega;
        const objX = centerX + Math.cos(angle) * radius;
        const objY = centerY + Math.sin(angle) * radius;
        
        // Circular path
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Center point
        ctx.fillStyle = "#666";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Radius line
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(objX, objY);
        ctx.stroke();
        
        // Object
        ctx.fillStyle = "#FF6B6B";
        ctx.beginPath();
        ctx.arc(objX, objY, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Centripetal acceleration (pointing to center)
        ctx.strokeStyle = "#4ECDC4";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(objX, objY);
        ctx.lineTo(objX + (centerX - objX) * 0.4, objY + (centerY - objY) * 0.4);
        ctx.stroke();
        
        // Velocity (tangent)
        const vx = -Math.sin(angle) * 40;
        const vy = Math.cos(angle) * 40;
        ctx.strokeStyle = "#FFD700";
        ctx.beginPath();
        ctx.moveTo(objX, objY);
        ctx.lineTo(objX + vx, objY + vy);
        ctx.stroke();
        
        ctx.fillStyle = "#4ECDC4";
        ctx.font = "12px Arial";
        ctx.fillText("ac", objX + (centerX - objX) * 0.2 + 10, objY + (centerY - objY) * 0.2);
        ctx.fillStyle = "#FFD700";
        ctx.fillText("v", objX + vx / 2 + 10, objY + vy / 2);
        
        ctx.fillStyle = "#FFF";
        ctx.textAlign = "center";
        ctx.fillText("ac = v²/r (Centripetal Acceleration)", centerX, 40);
      }
      // === NEWTONS FIRST LAW (Inertia) ===
      else if (state.simType.includes("newtons_first") || state.simType.includes("inertia")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        drawGround();
        
        if (!state.inertiaDemo) {
          state.inertiaDemo = { cartX: 100, ballX: 100, ballY: centerY, stopped: false, time: 0 };
        }
        
        const demo = state.inertiaDemo;
        demo.time += 0.016;
        
        // Cart moves then stops
        if (!demo.stopped && demo.cartX < centerX) {
          demo.cartX += 4;
          demo.ballX += 4;
        } else if (!demo.stopped) {
          demo.stopped = true;
        }
        
        // Ball continues moving (inertia)
        if (demo.stopped && demo.ballX < width - 50) {
          demo.ballX += 4;
          demo.ballY += 0.5; // Falls slightly
        }
        
        // Cart
        ctx.fillStyle = "#4169E1";
        ctx.fillRect(demo.cartX - 40, centerY + 20, 80, 30);
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(demo.cartX - 25, centerY + 55, 8, 0, Math.PI * 2);
        ctx.arc(demo.cartX + 25, centerY + 55, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Ball on/off cart
        ctx.fillStyle = "#FF6B6B";
        ctx.beginPath();
        ctx.arc(demo.ballX, demo.ballY, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset
        if (demo.ballX > width - 50) {
          state.inertiaDemo = { cartX: 100, ballX: 100, ballY: centerY, stopped: false, time: 0 };
        }
        
        ctx.fillStyle = "#FFF";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Newton's 1st Law: Objects in motion stay in motion", centerX, 40);
        ctx.fillText("(Ball continues when cart stops)", centerX, 60);
      }
      // === NEWTONS SECOND LAW (F=ma) ===
      else if (state.simType.includes("newtons_second") || state.simType === "f_equals_ma") {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        const objects = [
          { m: 1, a: 2, color: "#FF6B6B", y: height / 4 },
          { m: 2, a: 1, color: "#4ECDC4", y: height / 2 },
          { m: 4, a: 0.5, color: "#FFD700", y: 3 * height / 4 }
        ];
        
        if (!state.fmaDemo) {
          state.fmaDemo = { x: [100, 100, 100] };
        }
        
        objects.forEach((obj, i) => {
          // Same force F, different mass → different acceleration
          state.fmaDemo.x[i] += obj.a;
          if (state.fmaDemo.x[i] > width - 50) state.fmaDemo.x[i] = 100;
          
          const x = state.fmaDemo.x[i];
          
          // Track
          ctx.strokeStyle = "rgba(255,255,255,0.2)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(50, obj.y);
          ctx.lineTo(width - 50, obj.y);
          ctx.stroke();
          
          // Object (size based on mass)
          const size = 15 + obj.m * 8;
          ctx.fillStyle = obj.color;
          ctx.beginPath();
          ctx.arc(x, obj.y, size, 0, Math.PI * 2);
          ctx.fill();
          
          // Labels
          ctx.fillStyle = "#FFF";
          ctx.font = "12px Arial";
          ctx.textAlign = "left";
          ctx.fillText(`m = ${obj.m} kg`, 60, obj.y - size - 10);
          ctx.fillText(`a = ${obj.a} m/s²`, 60, obj.y + size + 20);
          ctx.fillText(`F = ${obj.m * obj.a} N`, 180, obj.y - size - 10);
        });
        
        ctx.fillStyle = "#FFF";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("F = ma (Newton's 2nd Law)", centerX, 30);
        ctx.font = "12px Arial";
        ctx.fillText("Same Force applied to different masses", centerX, 50);
      }
      // === NEWTONS THIRD LAW (Action-Reaction) ===
      else if (state.simType.includes("newtons_third") || state.simType.includes("action_reaction")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        if (!state.n3Demo) {
          state.n3Demo = { 
            x1: centerX - 60, x2: centerX + 60,
            v1: 0, v2: 0,
            pushing: true
          };
        }
        
        const demo = state.n3Demo;
        
        if (demo.pushing) {
          // Objects push apart
          demo.v1 = -2;
          demo.v2 = 2;
          demo.x1 += demo.v1;
          demo.x2 += demo.v2;
          
          if (demo.x1 < 100) demo.pushing = false;
        } else {
          // Reset
          demo.x1 += 1;
          demo.x2 -= 1;
          if (demo.x1 >= centerX - 60) {
            demo.x1 = centerX - 60;
            demo.x2 = centerX + 60;
            demo.pushing = true;
          }
        }
        
        // Object 1
        ctx.fillStyle = "#FF6B6B";
        ctx.fillRect(demo.x1 - 30, centerY - 30, 60, 60);
        ctx.fillStyle = "#FFF";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("A", demo.x1, centerY + 7);
        
        // Object 2
        ctx.fillStyle = "#4ECDC4";
        ctx.fillRect(demo.x2 - 30, centerY - 30, 60, 60);
        ctx.fillStyle = "#FFF";
        ctx.fillText("B", demo.x2, centerY + 7);
        
        // Force arrows
        if (demo.pushing) {
          ctx.strokeStyle = "#FFD700";
          ctx.lineWidth = 4;
          // Force on A (from B)
          ctx.beginPath();
          ctx.moveTo(demo.x1 + 35, centerY);
          ctx.lineTo(demo.x1 + 70, centerY);
          ctx.stroke();
          ctx.fillStyle = "#FFD700";
          ctx.beginPath();
          ctx.moveTo(demo.x1 + 35, centerY);
          ctx.lineTo(demo.x1 + 50, centerY - 8);
          ctx.lineTo(demo.x1 + 50, centerY + 8);
          ctx.fill();
          
          // Force on B (from A)
          ctx.beginPath();
          ctx.moveTo(demo.x2 - 35, centerY);
          ctx.lineTo(demo.x2 - 70, centerY);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(demo.x2 - 35, centerY);
          ctx.lineTo(demo.x2 - 50, centerY - 8);
          ctx.lineTo(demo.x2 - 50, centerY + 8);
          ctx.fill();
        }
        
        ctx.fillStyle = "#FFF";
        ctx.font = "14px Arial";
        ctx.fillText("Newton's 3rd Law: Every action has an equal and opposite reaction", centerX, 40);
        ctx.fillText("FAB = -FBA", centerX, height - 40);
      }
      // === ARCHIMEDES PRINCIPLE (Buoyancy) ===
      else if (state.simType.includes("archimedes") || state.simType.includes("buoyancy") || state.simType.includes("floating_sinking")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        // Tank
        ctx.strokeStyle = "rgba(200, 200, 255, 0.5)";
        ctx.lineWidth = 3;
        ctx.strokeRect(centerX - 120, 100, 240, 280);
        
        // Water
        const waterGrad = ctx.createLinearGradient(0, 120, 0, 380);
        waterGrad.addColorStop(0, "rgba(100, 180, 255, 0.6)");
        waterGrad.addColorStop(1, "rgba(50, 100, 200, 0.8)");
        ctx.fillStyle = waterGrad;
        ctx.fillRect(centerX - 117, 120, 234, 257);
        
        // Objects with different densities
        const objects = [
          { name: "Wood", density: 0.6, color: "#8B4513", y: 140 }, // Floats
          { name: "Ice", density: 0.9, color: "#E0FFFF", y: 200 },  // Mostly submerged
          { name: "Iron", density: 7.8, color: "#696969", y: 340 }  // Sinks
        ];
        
        objects.forEach((obj, i) => {
          const x = centerX - 80 + i * 80;
          const submerged = Math.min(1, obj.density);
          
          // Bobbing animation for floating objects
          const bobOffset = obj.density < 1 ? Math.sin(elapsed * 2 + i) * 5 : 0;
          
          ctx.fillStyle = obj.color;
          ctx.fillRect(x - 20, obj.y + bobOffset, 40, 40);
          
          // Water line indicator for floating objects
          if (obj.density < 1) {
            const waterLine = obj.y + bobOffset + 40 * submerged;
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(x - 25, waterLine);
            ctx.lineTo(x + 25, waterLine);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          
          ctx.fillStyle = "#FFF";
          ctx.font = "10px Arial";
          ctx.textAlign = "center";
          ctx.fillText(obj.name, x, obj.y + bobOffset - 5);
          ctx.fillText(`ρ=${obj.density}`, x, obj.y + bobOffset + 55);
        });
        
        ctx.fillStyle = "#FFF";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Archimedes: Fb = ρ·V·g", centerX, 60);
        ctx.fillText("Objects float if density < water (1.0 g/cm³)", centerX, 80);
      }
      // === TRANSVERSE WAVE ===
      else if (state.simType.includes("transverse_wave") || state.simType.includes("slinky_wave")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        const amplitude = 60;
        const wavelength = 150;
        const frequency = 2;
        
        // Wave
        ctx.strokeStyle = "#4ECDC4";
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 3) {
          const y = centerY + Math.sin((x / wavelength) * 2 * Math.PI - elapsed * frequency * 2 * Math.PI) * amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Particles showing transverse motion
        for (let i = 0; i < 10; i++) {
          const px = i * (width / 10) + 50;
          const py = centerY + Math.sin((px / wavelength) * 2 * Math.PI - elapsed * frequency * 2 * Math.PI) * amplitude;
          
          ctx.fillStyle = "#FF6B6B";
          ctx.beginPath();
          ctx.arc(px, py, 8, 0, Math.PI * 2);
          ctx.fill();
          
          // Vertical motion indicator
          ctx.strokeStyle = "rgba(255,255,255,0.3)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, centerY - amplitude - 10);
          ctx.lineTo(px, centerY + amplitude + 10);
          ctx.stroke();
        }
        
        // Equilibrium line
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Labels
        ctx.fillStyle = "#FFF";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Transverse Wave: Particles move ⊥ to wave direction", centerX, 40);
        ctx.fillText(`λ = ${wavelength}px, f = ${frequency}Hz, v = λf`, centerX, height - 30);
      }
      // === LONGITUDINAL WAVE ===
      else if (state.simType.includes("longitudinal_wave") || state.simType.includes("sound_wave")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        const numParticles = 40;
        const spacing = width / numParticles;
        const amplitude = 20;
        const frequency = 2;
        
        for (let i = 0; i < numParticles; i++) {
          const baseX = i * spacing + spacing / 2;
          const displacement = Math.sin((i / 8) * 2 * Math.PI - elapsed * frequency * 2) * amplitude;
          const px = baseX + displacement;
          
          // Compression/rarefaction coloring
          const compressionFactor = Math.cos((i / 8) * 2 * Math.PI - elapsed * frequency * 2);
          const colorIntensity = Math.abs(compressionFactor);
          
          ctx.fillStyle = compressionFactor > 0 
            ? `rgba(255, ${150 - colorIntensity * 100}, ${150 - colorIntensity * 100}, 0.8)` 
            : `rgba(${150 - colorIntensity * 100}, ${150 - colorIntensity * 100}, 255, 0.8)`;
          
          ctx.beginPath();
          ctx.arc(px, centerY, 10, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Direction arrow
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(50, centerY + 80);
        ctx.lineTo(width - 50, centerY + 80);
        ctx.stroke();
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.moveTo(width - 50, centerY + 80);
        ctx.lineTo(width - 70, centerY + 70);
        ctx.lineTo(width - 70, centerY + 90);
        ctx.fill();
        ctx.fillText("Wave Direction →", centerX, centerY + 100);
        
        ctx.fillStyle = "#FFF";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Longitudinal Wave (Sound): Particles move ∥ to wave direction", centerX, 40);
        ctx.fillText("Red = Compression, Blue = Rarefaction", centerX, 60);
      }
      // === COULOMBS LAW ===
      else if (state.simType.includes("coulomb") || state.simType.includes("electrostatic")) {
        ctx.fillStyle = "#0a0a15";
        ctx.fillRect(0, 0, width, height);
        
        if (!state.charges) {
          state.charges = [
            { x: centerX - 100, y: centerY, q: 1, vx: 0 },
            { x: centerX + 100, y: centerY, q: -1, vx: 0 }
          ];
        }
        
        // Coulomb's law: F = k * q1 * q2 / r²
        const k = 500;
        const dx = state.charges[1].x - state.charges[0].x;
        const r = Math.abs(dx);
        const force = k * state.charges[0].q * state.charges[1].q / (r * r);
        
        // Update positions (opposite charges attract)
        state.charges[0].vx += force * 0.01;
        state.charges[1].vx -= force * 0.01;
        
        state.charges[0].vx *= 0.98;
        state.charges[1].vx *= 0.98;
        
        state.charges[0].x += state.charges[0].vx;
        state.charges[1].x += state.charges[1].vx;
        
        // Keep in bounds
        if (Math.abs(state.charges[1].x - state.charges[0].x) < 60) {
          state.charges[0].x = centerX - 30;
          state.charges[1].x = centerX + 30;
          state.charges[0].vx = -2;
          state.charges[1].vx = 2;
        }
        
        // Draw charges
        state.charges.forEach((charge: any) => {
          const grad = ctx.createRadialGradient(charge.x, charge.y, 0, charge.x, charge.y, 30);
          grad.addColorStop(0, charge.q > 0 ? "#FF4444" : "#4444FF");
          grad.addColorStop(1, charge.q > 0 ? "#880000" : "#000088");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(charge.x, charge.y, 25, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = "#FFF";
          ctx.font = "bold 24px Arial";
          ctx.textAlign = "center";
          ctx.fillText(charge.q > 0 ? "+" : "−", charge.x, charge.y + 8);
        });
        
        // Force arrows
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 3;
        const arrowLen = Math.min(50, Math.abs(force) * 1000);
        ctx.beginPath();
        ctx.moveTo(state.charges[0].x + 30, centerY);
        ctx.lineTo(state.charges[0].x + 30 + arrowLen, centerY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(state.charges[1].x - 30, centerY);
        ctx.lineTo(state.charges[1].x - 30 - arrowLen, centerY);
        ctx.stroke();
        
        ctx.fillStyle = "#FFF";
        ctx.font = "14px Arial";
        ctx.fillText("F = k·q₁·q₂/r² (Coulomb's Law)", centerX, 40);
        ctx.fillText("Opposite charges attract", centerX, height - 30);
      }
      // === EXOTHERMIC REACTION ===
      else if (state.simType.includes("exothermic")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        // Beaker
        ctx.strokeStyle = "rgba(200, 200, 255, 0.5)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - 80, centerY - 100);
        ctx.lineTo(centerX - 80, centerY + 80);
        ctx.lineTo(centerX + 80, centerY + 80);
        ctx.lineTo(centerX + 80, centerY - 100);
        ctx.stroke();
        
        // Solution with heat glow
        const heatPhase = Math.min(1, elapsed / 3);
        const solutionGrad = ctx.createLinearGradient(0, centerY - 50, 0, centerY + 80);
        solutionGrad.addColorStop(0, `rgba(255, ${150 - heatPhase * 100}, ${100 - heatPhase * 100}, 0.8)`);
        solutionGrad.addColorStop(1, `rgba(255, ${100 - heatPhase * 50}, 50, 0.9)`);
        ctx.fillStyle = solutionGrad;
        ctx.fillRect(centerX - 77, centerY - 50, 154, 127);
        
        // Heat waves rising
        if (heatPhase > 0.3) {
          for (let i = 0; i < 3; i++) {
            const waveX = centerX - 40 + i * 40;
            ctx.strokeStyle = `rgba(255, 100, 50, ${0.5 - i * 0.15})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let y = centerY - 60; y > centerY - 150; y -= 5) {
              const xOffset = Math.sin((y + elapsed * 100) * 0.05) * 10;
              if (y === centerY - 60) ctx.moveTo(waveX + xOffset, y);
              else ctx.lineTo(waveX + xOffset, y);
            }
            ctx.stroke();
          }
        }
        
        // Temperature indicator
        const temp = 25 + heatPhase * 50;
        ctx.fillStyle = "#FFF";
        ctx.font = "16px Arial";
        ctx.textAlign = "right";
        ctx.fillText(`T = ${temp.toFixed(1)}°C`, width - 50, 50);
        
        // Thermometer
        ctx.fillStyle = "#333";
        ctx.fillRect(width - 45, 70, 20, 150);
        ctx.fillStyle = "#FF4444";
        ctx.fillRect(width - 42, 70 + 147 - heatPhase * 140, 14, heatPhase * 140 + 3);
        
        // Energy diagram
        ctx.strokeStyle = "#4ECDC4";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, height - 100);
        ctx.lineTo(150, height - 150);
        ctx.lineTo(250, height - 180);
        ctx.lineTo(350, height - 80);
        ctx.stroke();
        
        ctx.fillStyle = "#4ECDC4";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Reactants", 100, height - 60);
        ctx.fillText("Products", 350, height - 60);
        ctx.fillStyle = "#FF6B6B";
        ctx.fillText("↓ Energy Released", 200, height - 120);
        
        ctx.fillStyle = "#FFF";
        ctx.font = "14px Arial";
        ctx.fillText("Exothermic Reaction: ΔH < 0 (Heat Released)", centerX, 40);
      }
      // === ENDOTHERMIC REACTION ===
      else if (state.simType.includes("endothermic")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        // Beaker
        ctx.strokeStyle = "rgba(200, 200, 255, 0.5)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - 80, centerY - 100);
        ctx.lineTo(centerX - 80, centerY + 80);
        ctx.lineTo(centerX + 80, centerY + 80);
        ctx.lineTo(centerX + 80, centerY - 100);
        ctx.stroke();
        
        // Cold solution
        const coolPhase = Math.min(1, elapsed / 3);
        const solutionGrad = ctx.createLinearGradient(0, centerY - 50, 0, centerY + 80);
        solutionGrad.addColorStop(0, `rgba(100, ${150 + coolPhase * 50}, 255, 0.8)`);
        solutionGrad.addColorStop(1, `rgba(50, ${100 + coolPhase * 100}, 255, 0.9)`);
        ctx.fillStyle = solutionGrad;
        ctx.fillRect(centerX - 77, centerY - 50, 154, 127);
        
        // Frost effect on beaker
        if (coolPhase > 0.5) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(coolPhase - 0.5) * 0.3})`;
          for (let i = 0; i < 20; i++) {
            const fx = centerX - 75 + Math.random() * 150;
            const fy = centerY - 45 + Math.random() * 120;
            ctx.beginPath();
            ctx.arc(fx, fy, 2 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        // Temperature indicator
        const temp = 25 - coolPhase * 20;
        ctx.fillStyle = "#FFF";
        ctx.font = "16px Arial";
        ctx.textAlign = "right";
        ctx.fillText(`T = ${temp.toFixed(1)}°C`, width - 50, 50);
        
        // Thermometer
        ctx.fillStyle = "#333";
        ctx.fillRect(width - 45, 70, 20, 150);
        ctx.fillStyle = "#4444FF";
        ctx.fillRect(width - 42, 70 + 147 - (1 - coolPhase * 0.5) * 100, 14, (1 - coolPhase * 0.5) * 100);
        
        // Energy diagram
        ctx.strokeStyle = "#4ECDC4";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, height - 150);
        ctx.lineTo(150, height - 100);
        ctx.lineTo(250, height - 80);
        ctx.lineTo(350, height - 180);
        ctx.stroke();
        
        ctx.fillStyle = "#4ECDC4";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Reactants", 100, height - 60);
        ctx.fillText("Products", 350, height - 60);
        ctx.fillStyle = "#4ECDC4";
        ctx.fillText("↑ Energy Absorbed", 200, height - 130);
        
        ctx.fillStyle = "#FFF";
        ctx.font = "14px Arial";
        ctx.fillText("Endothermic Reaction: ΔH > 0 (Heat Absorbed)", centerX, 40);
      }
      // === STATES OF MATTER ===
      else if (state.simType.includes("states_of_matter") || state.simType.includes("phase_change") || state.simType.includes("kinetic_theory")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        const boxWidth = (width - 80) / 3;
        const states = ["Solid", "Liquid", "Gas"];
        const energyLevels = [0.2, 1, 3];
        
        states.forEach((stateName, i) => {
          const boxX = 30 + i * (boxWidth + 10);
          const boxY = 80;
          const boxHeight = height - 160;
          
          // Container
          ctx.strokeStyle = "#666";
          ctx.lineWidth = 2;
          ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
          
          // Label
          ctx.fillStyle = "#FFF";
          ctx.font = "bold 16px Arial";
          ctx.textAlign = "center";
          ctx.fillText(stateName, boxX + boxWidth / 2, 50);
          
          // Particles
          const numParticles = 20;
          const energy = energyLevels[i];
          
          if (!state[`stateParticles_${i}`]) {
            state[`stateParticles_${i}`] = [];
            for (let j = 0; j < numParticles; j++) {
              if (i === 0) {
                // Solid: grid pattern
                const row = Math.floor(j / 5);
                const col = j % 5;
                state[`stateParticles_${i}`].push({
                  x: boxX + 30 + col * 25,
                  y: boxY + boxHeight / 2 - 40 + row * 25,
                  vx: 0, vy: 0
                });
              } else {
                state[`stateParticles_${i}`].push({
                  x: boxX + 20 + Math.random() * (boxWidth - 40),
                  y: boxY + 20 + Math.random() * (boxHeight - 40),
                  vx: (Math.random() - 0.5) * energy * 3,
                  vy: (Math.random() - 0.5) * energy * 3
                });
              }
            }
          }
          
          // Update and draw particles
          state[`stateParticles_${i}`].forEach((p: any) => {
            // Vibration for solid
            if (i === 0) {
              const vibration = Math.sin(elapsed * 10 + p.x) * 2;
              ctx.fillStyle = "#4ECDC4";
              ctx.beginPath();
              ctx.arc(p.x + vibration, p.y + vibration * 0.5, 8, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Move for liquid/gas
              p.x += p.vx;
              p.y += p.vy;
              
              // Bounce off walls
              if (p.x < boxX + 15 || p.x > boxX + boxWidth - 15) p.vx *= -1;
              if (p.y < boxY + 15 || p.y > boxY + boxHeight - 15) p.vy *= -1;
              
              // Gravity for liquid
              if (i === 1) p.vy += 0.05;
              
              p.x = Math.max(boxX + 15, Math.min(boxX + boxWidth - 15, p.x));
              p.y = Math.max(boxY + 15, Math.min(boxY + boxHeight - 15, p.y));
              
              ctx.fillStyle = i === 1 ? "#4169E1" : "#FF6B6B";
              ctx.beginPath();
              ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
              ctx.fill();
            }
          });
          
          // Energy label
          ctx.fillStyle = "#AAA";
          ctx.font = "12px Arial";
          ctx.fillText(`KE: ${i === 0 ? "Low" : i === 1 ? "Medium" : "High"}`, boxX + boxWidth / 2, height - 50);
        });
        
        ctx.fillStyle = "#FFF";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("States of Matter: Particle Motion & Energy", centerX, 25);
      }
      // === ELECTRON SHELL ===
      else if (state.simType.includes("electron_shell") || state.simType.includes("valence") || state.simType.includes("atomic_model")) {
        ctx.fillStyle = "#0a0a15";
        ctx.fillRect(0, 0, width, height);
        
        // Nucleus
        const nucleusGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 25);
        nucleusGrad.addColorStop(0, "#FF6B6B");
        nucleusGrad.addColorStop(0.5, "#EE5A5A");
        nucleusGrad.addColorStop(1, "#CC4444");
        ctx.fillStyle = nucleusGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Electron shells (K, L, M)
        const shells = [
          { r: 60, electrons: 2, name: "K (n=1)" },
          { r: 100, electrons: 8, name: "L (n=2)" },
          { r: 140, electrons: 8, name: "M (n=3)" }
        ];
        
        shells.forEach((shell, shellIndex) => {
          // Shell orbit
          ctx.strokeStyle = `rgba(100, 200, 255, 0.3)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(centerX, centerY, shell.r, 0, Math.PI * 2);
          ctx.stroke();
          
          // Electrons
          for (let i = 0; i < shell.electrons; i++) {
            const angle = (i / shell.electrons) * Math.PI * 2 + elapsed * (1 + shellIndex * 0.3);
            const ex = centerX + Math.cos(angle) * shell.r;
            const ey = centerY + Math.sin(angle) * shell.r;
            
            ctx.fillStyle = "#00FFFF";
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#00FFFF";
            ctx.beginPath();
            ctx.arc(ex, ey, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
          
          // Shell label
          ctx.fillStyle = "#888";
          ctx.font = "11px Arial";
          ctx.textAlign = "left";
          ctx.fillText(shell.name, centerX + shell.r + 10, centerY);
        });
        
        ctx.fillStyle = "#FFF";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Electron Shells: Bohr Model (e.g., Argon: 2-8-8)", centerX, 40);
        ctx.fillText("Valence electrons in outermost shell determine reactivity", centerX, height - 30);
      }
      // === SOLAR SYSTEM ===
      else if (state.simType.includes("solar_system") || state.simType.includes("earth_orbit")) {
        ctx.fillStyle = "#000008";
        ctx.fillRect(0, 0, width, height);
        
        // Stars
        for (let i = 0; i < 100; i++) {
          ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.5})`;
          ctx.beginPath();
          ctx.arc((i * 73) % width, (i * 41) % height, 1, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Sun
        const sunGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 35);
        sunGrad.addColorStop(0, "#FFFFFF");
        sunGrad.addColorStop(0.3, "#FFFF00");
        sunGrad.addColorStop(0.7, "#FF8C00");
        sunGrad.addColorStop(1, "#FF4500");
        ctx.fillStyle = sunGrad;
        ctx.shadowBlur = 40;
        ctx.shadowColor = "#FF8C00";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Planets
        const planets = [
          { name: "Mercury", r: 55, size: 4, color: "#C0C0C0", speed: 4.15 },
          { name: "Venus", r: 75, size: 6, color: "#DEB887", speed: 1.62 },
          { name: "Earth", r: 100, size: 7, color: "#4169E1", speed: 1 },
          { name: "Mars", r: 125, size: 5, color: "#CD853F", speed: 0.53 },
          { name: "Jupiter", r: 160, size: 12, color: "#DEB887", speed: 0.084 },
          { name: "Saturn", r: 195, size: 10, color: "#F4A460", speed: 0.034 }
        ];
        
        planets.forEach(planet => {
          // Orbit path
          ctx.strokeStyle = "rgba(255,255,255,0.1)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(centerX, centerY, planet.r, 0, Math.PI * 2);
          ctx.stroke();
          
          // Planet
          const angle = elapsed * planet.speed * 0.3;
          const px = centerX + Math.cos(angle) * planet.r;
          const py = centerY + Math.sin(angle) * planet.r;
          
          const planetGrad = ctx.createRadialGradient(px - 2, py - 2, 0, px, py, planet.size);
          planetGrad.addColorStop(0, "#FFF");
          planetGrad.addColorStop(0.5, planet.color);
          planetGrad.addColorStop(1, planet.color);
          ctx.fillStyle = planetGrad;
          ctx.beginPath();
          ctx.arc(px, py, planet.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Saturn's rings
          if (planet.name === "Saturn") {
            ctx.strokeStyle = "#DEB887";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(px, py, planet.size + 6, 3, 0.3, 0, Math.PI * 2);
            ctx.stroke();
          }
        });
        
        ctx.fillStyle = "#FFF";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Solar System: Kepler's Laws of Planetary Motion", centerX, 30);
      }
      // === GALAXY ===
      else if (state.simType.includes("galaxy")) {
        ctx.fillStyle = "#000005";
        ctx.fillRect(0, 0, width, height);
        
        // Spiral arms
        for (let arm = 0; arm < 2; arm++) {
          for (let i = 0; i < 200; i++) {
            const angle = arm * Math.PI + i * 0.08 + elapsed * 0.2;
            const dist = 20 + i * 0.8;
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist * 0.4;
            
            const alpha = Math.max(0, 1 - dist / 200);
            const size = 1 + Math.random() * 2;
            const colors = ["#FFFFFF", "#FFD700", "#87CEEB", "#FFA500"];
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.globalAlpha = alpha * 0.8;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;

        // Core
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
        coreGrad.addColorStop(0, "rgba(255, 255, 200, 0.8)");
        coreGrad.addColorStop(0.5, "rgba(255, 200, 100, 0.4)");
        coreGrad.addColorStop(1, "transparent");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
        ctx.fill();
      }
      // === DNA REPLICATION ===
      else if (state.simType.includes("dna") || state.simType.includes("replication")) {
        ctx.fillStyle = "#0a0a15";
        ctx.fillRect(0, 0, width, height);
        
        drawDNA(centerX, centerY, elapsed);
      }
      // === CELL DIVISION ===
      else if (state.simType.includes("cell_division") || state.simType.includes("mitosis") || state.simType.includes("cell")) {
        ctx.fillStyle = "#0a0a15";
        ctx.fillRect(0, 0, width, height);
        
        const phase = elapsed % 8;
        const sep = phase > 4 ? (phase - 4) * 30 : 0;
        
        // Cell membrane(s)
        const cellSize = 80 - sep * 0.5;
        
        const drawCell = (x: number, y: number, size: number) => {
          const cellGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
          cellGrad.addColorStop(0, "rgba(200, 230, 255, 0.3)");
          cellGrad.addColorStop(0.8, "rgba(150, 200, 255, 0.2)");
          cellGrad.addColorStop(1, "rgba(100, 150, 200, 0.5)");
          ctx.fillStyle = cellGrad;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(100, 150, 255, 0.8)";
          ctx.lineWidth = 3;
          ctx.stroke();

          // Nucleus
          ctx.fillStyle = "rgba(100, 50, 150, 0.6)";
          ctx.beginPath();
          ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        };

        if (sep > 0) {
          drawCell(centerX - sep, centerY, cellSize);
          drawCell(centerX + sep, centerY, cellSize);
        } else {
          drawCell(centerX, centerY, cellSize);
          // Chromosomes aligning
          for (let i = 0; i < 6; i++) {
            const cy = centerY - 30 + i * 12;
            ctx.fillStyle = "#FF6B6B";
            ctx.fillRect(centerX - 15 + Math.sin(elapsed * 2 + i) * 5, cy, 30, 4);
          }
        }
      }
      // === CHEMICAL REACTION ===
      else if (state.simType.includes("reaction") || state.simType.includes("molecular_bond") || state.simType.includes("bond") || state.simType.includes("molecule")) {
        ctx.fillStyle = "#0a0a15";
        ctx.fillRect(0, 0, width, height);
        
        drawMolecule(centerX - 100 + Math.sin(elapsed) * 20, centerY, 20, elapsed);
        drawMolecule(centerX + 100 - Math.sin(elapsed) * 20, centerY, 20, elapsed);
        
        // Reaction indicators
        if (elapsed > 2) {
          ctx.fillStyle = "rgba(255, 200, 100, 0.5)";
          ctx.font = "30px Arial";
          ctx.textAlign = "center";
          ctx.fillText("→", centerX, centerY + 10);
          
          // Product molecule forming
          drawMolecule(centerX, centerY + 100, 25, elapsed);
        }
      }
      // === ACID-BASE ===
      else if (state.simType.includes("acid") || state.simType.includes("base") || state.simType.includes("neutralization")) {
        ctx.fillStyle = "#0a0a10";
        ctx.fillRect(0, 0, width, height);
        
        // Container
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 3;
        ctx.strokeRect(centerX - 100, centerY - 80, 200, 180);
        
        const mixProgress = Math.min(1, elapsed / 3);
        
        // Acid layer (green)
        ctx.fillStyle = `rgba(100, 255, 100, ${0.6 * (1 - mixProgress)})`;
        ctx.fillRect(centerX - 97, centerY - 77, 194, 87 * (1 - mixProgress));
        
        // Base layer (blue)
        ctx.fillStyle = `rgba(100, 100, 255, ${0.6 * (1 - mixProgress)})`;
        ctx.fillRect(centerX - 97, centerY + 10, 194, 87 * (1 - mixProgress));
        
        // Neutral solution (purple)
        ctx.fillStyle = `rgba(150, 100, 200, ${0.6 * mixProgress})`;
        ctx.fillRect(centerX - 97, centerY - 77, 194, 174);
        
        // pH indicator
        ctx.fillStyle = "#FFF";
        ctx.font = "16px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`pH: ${(7 + (1 - mixProgress) * (state.simType.includes("acid") ? -4 : 4)).toFixed(1)}`, centerX + 110, centerY);
        
        // Bubbles during reaction
        if (mixProgress < 0.9 && Math.random() > 0.6) {
          particlesRef.current.push(createParticle(
            centerX - 80 + Math.random() * 160,
            centerY + 80,
            "bubble", ["rgba(255,255,255,0.5)"],
            { vx: (Math.random() - 0.5) * 2, vy: -3 - Math.random() * 3, size: 4 + Math.random() * 6, maxLife: 1, decay: 0.02 }
          ));
        }
      }
      // === COMBUSTION ===
      else if (state.simType.includes("combustion")) {
        drawGround();
        
        const fireX = centerX;
        const fireY = groundY;
        
        // Fuel source
        ctx.fillStyle = "#4a3728";
        ctx.fillRect(fireX - 40, fireY - 20, 80, 20);
        
        // Fire particles
        for (let i = 0; i < 10 * intensity; i++) {
          particlesRef.current.push(createParticle(
            fireX + (Math.random() - 0.5) * 60, fireY - 25,
            "fire", state.colors,
            { vy: -5 - Math.random() * 8, vx: (Math.random() - 0.5) * 3, size: 8 + Math.random() * 12, maxLife: 0.6, decay: 0.025 }
          ));
        }
        
        // CO2 molecules rising
        if (Math.random() > 0.8) {
          particlesRef.current.push(createParticle(
            fireX + (Math.random() - 0.5) * 80, fireY - 100,
            "co2", ["rgba(100,100,100,0.5)"],
            { vy: -2, vx: (Math.random() - 0.5) * 1, size: 15, maxLife: 2, decay: 0.008 }
          ));
        }
        
        // Oxygen molecules being consumed (blue dots entering)
        if (Math.random() > 0.7) {
          const side = Math.random() > 0.5 ? 1 : -1;
          particlesRef.current.push(createParticle(
            fireX + side * 100, fireY - 50,
            "o2", ["#00BFFF"],
            { vx: -side * 3, vy: 0, size: 5, maxLife: 0.8, decay: 0.02 }
          ));
        }
      }
      // === BOILING ===
      else if (state.simType.includes("boiling") || state.simType.includes("bubbling") || state.simType.includes("evaporation")) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        
        // Beaker
        ctx.strokeStyle = "rgba(200, 200, 255, 0.5)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - 80, centerY - 100);
        ctx.lineTo(centerX - 80, centerY + 80);
        ctx.lineTo(centerX + 80, centerY + 80);
        ctx.lineTo(centerX + 80, centerY - 100);
        ctx.stroke();
        
        // Water
        const waterGrad = ctx.createLinearGradient(0, centerY, 0, centerY + 80);
        waterGrad.addColorStop(0, "rgba(100, 180, 255, 0.6)");
        waterGrad.addColorStop(1, "rgba(50, 100, 200, 0.8)");
        ctx.fillStyle = waterGrad;
        ctx.fillRect(centerX - 77, centerY - 20, 154, 97);
        
        // Burner glow
        const burnerGrad = ctx.createRadialGradient(centerX, centerY + 100, 0, centerX, centerY + 100, 60);
        burnerGrad.addColorStop(0, "rgba(255, 100, 0, 0.6)");
        burnerGrad.addColorStop(1, "transparent");
        ctx.fillStyle = burnerGrad;
        ctx.fillRect(centerX - 60, centerY + 80, 120, 40);
        
        // Bubbles
        if (Math.random() > 0.4) {
          particlesRef.current.push(createParticle(
            centerX - 60 + Math.random() * 120, centerY + 60,
            "bubble", ["rgba(200,220,255,0.6)"],
            { vx: (Math.random() - 0.5) * 2, vy: -4 - Math.random() * 4, size: 5 + Math.random() * 10, maxLife: 1.2, decay: 0.015 }
          ));
        }
        
        // Steam
        if (Math.random() > 0.6) {
          particlesRef.current.push(createParticle(
            centerX - 60 + Math.random() * 120, centerY - 30,
            "steam", ["rgba(200,200,255,0.3)"],
            { vx: (Math.random() - 0.5) * 2, vy: -2 - Math.random() * 2, size: 20 + Math.random() * 20, maxLife: 1.5, decay: 0.01 }
          ));
        }
      }
      // === DIFFUSION / BROWNIAN MOTION ===
      else if (state.simType.includes("diffusion") || state.simType.includes("brownian")) {
        ctx.fillStyle = "#0a0a15";
        ctx.fillRect(0, 0, width, height);
        
        // Container
        ctx.strokeStyle = "rgba(200, 200, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 50, width - 100, height - 100);
        
        // Initialize particles if needed
        if (!state.diffusionParticles) {
          state.diffusionParticles = [];
          // Concentrated particles on left
          for (let i = 0; i < 100; i++) {
            state.diffusionParticles.push({
              x: 80 + Math.random() * 80,
              y: 80 + Math.random() * (height - 160),
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              color: i < 50 ? "#FF6B6B" : "#4ECDC4"
            });
          }
        }
        
        // Update and draw particles
        state.diffusionParticles.forEach((p: any) => {
          // Brownian random walk
          p.vx += (Math.random() - 0.5) * 2;
          p.vy += (Math.random() - 0.5) * 2;
          p.vx *= 0.95;
          p.vy *= 0.95;
          p.x += p.vx;
          p.y += p.vy;
          
          // Boundary collision
          if (p.x < 55 || p.x > width - 55) p.vx *= -1;
          if (p.y < 55 || p.y > height - 55) p.vy *= -1;
          p.x = Math.max(55, Math.min(width - 55, p.x));
          p.y = Math.max(55, Math.min(height - 55, p.y));
          
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      // === PRISM / RAINBOW ===
      else if (state.simType.includes("prism") || state.simType.includes("rainbow") || state.simType.includes("spectrum") || state.simType.includes("refraction")) {
        ctx.fillStyle = "#0a0a10";
        ctx.fillRect(0, 0, width, height);
        
        // Incoming white light beam
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 8;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#FFFFFF";
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(centerX - 40, centerY);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Prism
        ctx.fillStyle = "rgba(200, 200, 255, 0.3)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 60);
        ctx.lineTo(centerX + 60, centerY + 60);
        ctx.lineTo(centerX - 60, centerY + 60);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Dispersed rainbow
        const rainbowColors = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8B00FF"];
        rainbowColors.forEach((color, i) => {
          const angle = -0.3 + i * 0.1;
          ctx.strokeStyle = color;
          ctx.lineWidth = 4;
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          ctx.beginPath();
          ctx.moveTo(centerX + 40, centerY + 20);
          ctx.lineTo(width, centerY + 20 + Math.tan(angle) * (width - centerX - 40));
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
      }
      // === PENDULUM ===
      else if (state.simType.includes("pendulum") || state.simType.includes("swing")) {
        drawGround();
        
        const pivotX = centerX;
        const pivotY = 80;
        const length = 180;
        
        if (!state.pendulum) {
          state.pendulum = { angle: Math.PI / 3, velocity: 0 };
        }
        
        // Physics
        const angularAccel = -gravity * 0.01 * Math.sin(state.pendulum.angle);
        state.pendulum.velocity += angularAccel;
        state.pendulum.velocity *= 0.999; // Damping
        state.pendulum.angle += state.pendulum.velocity;
        
        const bobX = pivotX + Math.sin(state.pendulum.angle) * length;
        const bobY = pivotY + Math.cos(state.pendulum.angle) * length;
        
        // Pivot
        ctx.fillStyle = "#666";
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // String
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();
        
        // Bob
        const bobGrad = ctx.createRadialGradient(bobX - 5, bobY - 5, 0, bobX, bobY, objectSize);
        bobGrad.addColorStop(0, "#FFF");
        bobGrad.addColorStop(0.5, state.colors[0]);
        bobGrad.addColorStop(1, state.colors[1] || state.colors[0]);
        ctx.fillStyle = bobGrad;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.arc(bobX, bobY, objectSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Motion blur trail
        particlesRef.current.push(createParticle(
          bobX, bobY, "trail", [state.colors[0] + "40"],
          { vx: 0, vy: 0, size: objectSize * 0.8, maxLife: 0.3, decay: 0.05 }
        ));
      }
      // === SPRING / HARMONIC MOTION ===
      else if (state.simType.includes("spring") || state.simType.includes("harmonic") || state.simType.includes("oscillat")) {
        drawGround();
        
        const anchorX = 100;
        const anchorY = centerY;
        const restLength = 150;
        
        if (!state.spring) {
          state.spring = { displacement: 80, velocity: 0 };
        }
        
        // Hooke's law: F = -kx
        const k = 0.1;
        const acceleration = -k * state.spring.displacement;
        state.spring.velocity += acceleration;
        state.spring.velocity *= 0.99;
        state.spring.displacement += state.spring.velocity;
        
        const currentLength = restLength + state.spring.displacement;
        const massX = anchorX + currentLength;
        
        // Wall
        ctx.fillStyle = "#444";
        ctx.fillRect(anchorX - 20, anchorY - 40, 20, 80);
        
        // Spring coils
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 3;
        ctx.beginPath();
        const coils = 12;
        const coilWidth = 20;
        for (let i = 0; i <= coils; i++) {
          const x = anchorX + (i / coils) * currentLength;
          const y = anchorY + (i % 2 === 0 ? coilWidth : -coilWidth);
          if (i === 0) ctx.moveTo(anchorX, anchorY);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(massX, anchorY);
        ctx.stroke();
        
        // Mass
        const massGrad = ctx.createRadialGradient(massX, anchorY, 0, massX, anchorY, 30);
        massGrad.addColorStop(0, "#FFF");
        massGrad.addColorStop(0.5, state.colors[0]);
        massGrad.addColorStop(1, state.colors[1] || state.colors[0]);
        ctx.fillStyle = massGrad;
        ctx.fillRect(massX - 25, anchorY - 25, 50, 50);
      }
      // === COLLISION / MOMENTUM ===
      else if (state.simType.includes("collision") || state.simType.includes("momentum") || state.simType.includes("cradle")) {
        drawGround();
        
        if (!state.balls) {
          state.balls = [
            { x: 100, vx: 5, mass: 1, color: "#FF6B6B" },
            { x: width - 100, vx: -5, mass: 1, color: "#4ECDC4" }
          ];
          state.collided = false;
        }
        
        const ballSize = 30;
        
        // Update positions
        if (!state.collided) {
          state.balls.forEach((b: any) => b.x += b.vx);
          
          // Check collision
          if (Math.abs(state.balls[0].x - state.balls[1].x) < ballSize * 2) {
            state.collided = true;
            // Elastic collision
            const v1 = state.balls[0].vx;
            const v2 = state.balls[1].vx;
            state.balls[0].vx = v2;
            state.balls[1].vx = v1;
            
            // Impact particles
            const impactX = (state.balls[0].x + state.balls[1].x) / 2;
            for (let i = 0; i < 20; i++) {
              particlesRef.current.push(createParticle(
                impactX, centerY, "spark", ["#FFFFFF", "#FFFF00"],
                { vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, size: 3, maxLife: 0.5, decay: 0.03 }
              ));
            }
          }
        } else {
          state.balls.forEach((b: any) => b.x += b.vx);
        }
        
        // Draw balls
        state.balls.forEach((b: any) => {
          const grad = ctx.createRadialGradient(b.x - 5, centerY - 5, 0, b.x, centerY, ballSize);
          grad.addColorStop(0, "#FFF");
          grad.addColorStop(0.5, b.color);
          grad.addColorStop(1, b.color);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(b.x, centerY, ballSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Velocity arrow
          ctx.strokeStyle = "#FFF";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(b.x, centerY - 50);
          ctx.lineTo(b.x + b.vx * 10, centerY - 50);
          ctx.stroke();
        });
      }
      // === PORTAL / MAGIC ===
      else if (state.simType.includes("portal")) {
        ctx.fillStyle = "#0a0a15";
        ctx.fillRect(0, 0, width, height);
        
        // Portal ring
        const portalGrad = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, 100);
        portalGrad.addColorStop(0, "transparent");
        portalGrad.addColorStop(0.3, "rgba(138, 43, 226, 0.8)");
        portalGrad.addColorStop(0.5, "rgba(0, 255, 255, 0.6)");
        portalGrad.addColorStop(0.7, "rgba(255, 0, 255, 0.8)");
        portalGrad.addColorStop(1, "transparent");
        
        ctx.fillStyle = portalGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner void
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
        ctx.fill();
        
        // Swirling particles
        for (let i = 0; i < 8; i++) {
          const angle = elapsed * 2 + i * Math.PI / 4;
          const dist = 60 + Math.sin(elapsed * 3 + i) * 20;
          particlesRef.current.push(createParticle(
            centerX + Math.cos(angle) * dist,
            centerY + Math.sin(angle) * dist,
            "magic", state.colors,
            { vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, size: 5, maxLife: 0.5, decay: 0.03 }
          ));
        }
      }
      // === ENERGY BEAM / LASER ===
      else if (state.simType.includes("laser") || state.simType.includes("beam") || state.simType.includes("energy_beam")) {
        ctx.fillStyle = "#0a0a10";
        ctx.fillRect(0, 0, width, height);
        
        // Laser source
        ctx.fillStyle = "#333";
        ctx.fillRect(20, centerY - 30, 60, 60);
        
        // Beam
        const beamColor = state.simType.includes("laser") ? "#FF0000" : "#00FFFF";
        ctx.strokeStyle = beamColor;
        ctx.lineWidth = 8;
        ctx.shadowBlur = 30;
        ctx.shadowColor = beamColor;
        ctx.beginPath();
        ctx.moveTo(80, centerY);
        ctx.lineTo(width - 50, centerY);
        ctx.stroke();
        
        // Core
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(80, centerY);
        ctx.lineTo(width - 50, centerY);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Target glow
        const targetGrad = ctx.createRadialGradient(width - 50, centerY, 0, width - 50, centerY, 50);
        targetGrad.addColorStop(0, beamColor);
        targetGrad.addColorStop(0.5, beamColor + "80");
        targetGrad.addColorStop(1, "transparent");
        ctx.fillStyle = targetGrad;
        ctx.beginPath();
        ctx.arc(width - 50, centerY, 50, 0, Math.PI * 2);
        ctx.fill();
        
        // Beam particles
        if (Math.random() > 0.5) {
          particlesRef.current.push(createParticle(
            80 + Math.random() * (width - 150), centerY + (Math.random() - 0.5) * 10,
            "photon", [beamColor, "#FFFFFF"],
            { vx: 15, vy: 0, size: 3, maxLife: 0.3, decay: 0.05 }
          ));
        }
      }
      // === WATER / FLOOD / RAIN / TSUNAMI ===
      else if (state.simType.includes("water") || state.simType.includes("flood") || state.simType.includes("wave") || state.simType.includes("ocean") || state.simType.includes("rain") || state.simType.includes("tsunami")) {
        drawGround();
        
        if (!state.waterLevel) state.waterLevel = height;
        if (!state.waveOffset) state.waveOffset = 0;
        
        if (state.simType.includes("rain")) {
          // Rain drops
          for (let i = 0; i < 5; i++) {
            particlesRef.current.push(createParticle(
              Math.random() * width, -10, "rain", state.colors,
              { vy: 12 + Math.random() * 8, vx: -2, size: 2, maxLife: 1.5, decay: 0.01 }
            ));
          }
        } else {
          // Rising water with waves
          if (state.waterLevel > groundY - (state.simType.includes("tsunami") ? 250 : 150)) {
            state.waterLevel -= state.simType.includes("tsunami") ? 3 : 1.5;
          }
          state.waveOffset += 4;
          
          const waterGradient = ctx.createLinearGradient(0, state.waterLevel, 0, height);
          waterGradient.addColorStop(0, "rgba(30, 144, 255, 0.8)");
          waterGradient.addColorStop(0.5, "rgba(0, 100, 180, 0.9)");
          waterGradient.addColorStop(1, "rgba(0, 50, 120, 0.95)");
          
          ctx.fillStyle = waterGradient;
          ctx.beginPath();
          ctx.moveTo(0, height);
          
          const waveAmp = state.simType.includes("tsunami") ? 40 : 15;
          for (let x = 0; x <= width; x += 10) {
            const waveHeight = Math.sin((x + state.waveOffset) * 0.02) * waveAmp + 
                              Math.sin((x + state.waveOffset * 1.5) * 0.04) * (waveAmp / 2);
            ctx.lineTo(x, state.waterLevel + waveHeight);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();
          
          // Foam
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let x = 0; x <= width; x += 10) {
            const waveHeight = Math.sin((x + state.waveOffset) * 0.02) * waveAmp;
            if (x === 0) ctx.moveTo(x, state.waterLevel + waveHeight);
            else ctx.lineTo(x, state.waterLevel + waveHeight);
          }
          ctx.stroke();
        }
      }
      // === FIRE ===
      else if (state.simType.includes("fire") || state.simType.includes("burn") || state.simType.includes("flame")) {
        drawGround();
        
        const fireX = centerX;
        
        // Fire particles
        for (let i = 0; i < 8 * intensity; i++) {
          particlesRef.current.push(createParticle(
            fireX + (Math.random() - 0.5) * 80, groundY - 5,
            "fire", state.colors,
            { vy: -4 - Math.random() * 6, vx: (Math.random() - 0.5) * 2, size: 6 + Math.random() * 10, maxLife: 0.6 + Math.random() * 0.4, decay: 0.025 }
          ));
        }
        
        // Smoke
        if (Math.random() > 0.6) {
          particlesRef.current.push(createParticle(
            fireX + (Math.random() - 0.5) * 40, groundY - 100,
            "smoke", getColors("smoke"),
            { vy: -2, vx: (Math.random() - 0.5) * 1, size: 15 + Math.random() * 20, maxLife: 1.5, decay: 0.008 }
          ));
        }
        
        // Ground glow
        const glowGradient = ctx.createRadialGradient(fireX, groundY, 0, fireX, groundY, 150);
        glowGradient.addColorStop(0, "rgba(255, 100, 0, 0.3)");
        glowGradient.addColorStop(1, "transparent");
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, width, height);
      }
      // === EXPLOSION ===
      else if (state.simType.includes("explo") || state.simType.includes("bomb") || state.simType.includes("blast")) {
        drawGround();
        
        if (!state.exploded) {
          state.exploded = true;
          
          for (let i = 0; i < particleCount * 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 15;
            particlesRef.current.push(createParticle(
              centerX, centerY, "explosion", state.colors,
              { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3, size: 5 + Math.random() * 15, maxLife: 0.8 + Math.random() * 0.5, decay: 0.018 }
            ));
          }
          
          // Debris
          for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 8 + Math.random() * 12;
            particlesRef.current.push(createParticle(
              centerX, centerY, "debris", getColors("earth"),
              { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 5, size: 3 + Math.random() * 6, maxLife: 1.5, decay: 0.012, rotation: Math.random() * Math.PI * 2 }
            ));
          }
        }
        
        // Flash
        if (elapsed < 0.2) {
          ctx.fillStyle = `rgba(255, 255, 200, ${0.8 - elapsed * 4})`;
          ctx.fillRect(0, 0, width, height);
        }
      }
      // === LIGHTNING ===
      else if (state.simType.includes("lightning") || state.simType.includes("thunder")) {
        drawGround();
        
        ctx.fillStyle = "rgba(20, 20, 40, 0.3)";
        ctx.fillRect(0, 0, width, height);
        
        if (!state.lastBolt) state.lastBolt = 0;
        
        if (elapsed - state.lastBolt > 0.5 + Math.random() * 1.5) {
          state.lastBolt = elapsed;
          const boltX = width * 0.2 + Math.random() * width * 0.6;
          const endX = drawLightningBolt(boltX, 0, groundY);
          
          // Ground sparks
          for (let i = 0; i < 30; i++) {
            particlesRef.current.push(createParticle(
              endX, groundY - 5, "spark", state.colors,
              { vx: (Math.random() - 0.5) * 12, vy: -5 - Math.random() * 10, size: 2 + Math.random() * 3, maxLife: 0.5, decay: 0.03 }
            ));
          }
          
          // Flash
          ctx.fillStyle = "rgba(200, 220, 255, 0.4)";
          ctx.fillRect(0, 0, width, height);
        }
        
        // Rain
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push(createParticle(
            Math.random() * width, -10, "rain", getColors("water"),
            { vy: 15, vx: -3, size: 1.5, maxLife: 1, decay: 0.02 }
          ));
        }
      }
      // === SNOW ===
      else if (state.simType.includes("snow") || state.simType.includes("blizzard") || state.simType.includes("winter")) {
        const snowGround = ctx.createLinearGradient(0, groundY - 20, 0, height);
        snowGround.addColorStop(0, "#FFFFFF");
        snowGround.addColorStop(1, "#E8E8E8");
        ctx.fillStyle = snowGround;
        ctx.fillRect(0, groundY - 20, width, height);
        
        for (let i = 0; i < 4; i++) {
          particlesRef.current.push(createParticle(
            Math.random() * width, -10, "snow", state.colors,
            { vy: 1 + Math.random() * 2, vx: Math.sin(elapsed * 2 + Math.random()) * 1, size: 3 + Math.random() * 5, maxLife: 3, decay: 0.005, rotation: Math.random() * Math.PI * 2 }
          ));
        }
      }
      // === TORNADO ===
      else if (state.simType.includes("tornado") || state.simType.includes("wind") || state.simType.includes("cyclone") || state.simType.includes("hurricane")) {
        drawGround();
        
        if (!state.tornadoAngle) state.tornadoAngle = 0;
        state.tornadoAngle += 0.15;
        
        for (let i = 0; i < 10; i++) {
          const heightRatio = Math.random();
          const radius = 20 + heightRatio * 80;
          const angle = state.tornadoAngle + heightRatio * Math.PI * 4 + Math.random();
          const y = groundY - heightRatio * 300;
          
          particlesRef.current.push(createParticle(
            centerX + Math.cos(angle) * radius, y, "debris", getColors("dust"),
            { vx: Math.cos(angle + Math.PI/2) * 8, vy: -2 - Math.random() * 3, size: 3 + Math.random() * 5, maxLife: 0.5, decay: 0.03 }
          ));
        }
      }
      // === VOLCANO / MAGMA CHAMBER ===
      else if (state.simType.includes("volcano") || state.simType.includes("lava") || state.simType.includes("eruption") || state.simType.includes("magma")) {
        // Volcano shape
        ctx.fillStyle = "#2a2020";
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width * 0.3, groundY);
        ctx.lineTo(width * 0.4, groundY - 100);
        ctx.lineTo(width * 0.5, groundY - 130);
        ctx.lineTo(width * 0.6, groundY - 100);
        ctx.lineTo(width * 0.7, groundY);
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
        
        // Lava glow
        const lavaGlow = ctx.createRadialGradient(centerX, groundY - 130, 0, centerX, groundY - 130, 50);
        lavaGlow.addColorStop(0, "#FF4500");
        lavaGlow.addColorStop(0.5, "#FF2200");
        lavaGlow.addColorStop(1, "transparent");
        ctx.fillStyle = lavaGlow;
        ctx.fillRect(width * 0.35, groundY - 180, width * 0.3, 100);
        
        // Eruption
        for (let i = 0; i < 5; i++) {
          particlesRef.current.push(createParticle(
            centerX + (Math.random() - 0.5) * 40, groundY - 130, "lava", state.colors,
            { vx: (Math.random() - 0.5) * 8, vy: -10 - Math.random() * 15, size: 8 + Math.random() * 15, maxLife: 1.2, decay: 0.015 }
          ));
        }
        
        // Smoke
        for (let i = 0; i < 2; i++) {
          particlesRef.current.push(createParticle(
            centerX + (Math.random() - 0.5) * 60, groundY - 150, "smoke", getColors("smoke"),
            { vx: (Math.random() - 0.5) * 2, vy: -3 - Math.random() * 4, size: 25 + Math.random() * 30, maxLife: 2, decay: 0.006 }
          ));
        }
      }
      // === EARTHQUAKE ===
      else if (state.simType.includes("earthquake") || state.simType.includes("quake") || state.simType.includes("shake")) {
        const shakeX = (Math.random() - 0.5) * 20 * Math.sin(elapsed * 30);
        const shakeY = (Math.random() - 0.5) * 15 * Math.sin(elapsed * 25);
        
        ctx.save();
        ctx.translate(shakeX, shakeY);
        drawGround();
        
        // Cracks
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          let cx = (width / 6) * (i + 1);
          ctx.moveTo(cx, groundY);
          for (let j = 0; j < 5; j++) {
            cx += (Math.random() - 0.5) * 30;
            ctx.lineTo(cx, groundY + 10 + j * 15);
          }
          ctx.stroke();
        }
        
        ctx.restore();
        
        // Debris
        if (Math.random() > 0.5) {
          particlesRef.current.push(createParticle(
            Math.random() * width, groundY - 5, "debris", getColors("earth"),
            { vx: (Math.random() - 0.5) * 6, vy: -3 - Math.random() * 8, size: 4 + Math.random() * 8, maxLife: 1, decay: 0.02 }
          ));
        }
      }
      // === MAGIC ===
      else if (state.simType.includes("magic") || state.simType.includes("sparkle") || state.simType.includes("fairy") || state.simType.includes("spell")) {
        drawGround();
        
        for (let i = 0; i < 6; i++) {
          const angle = elapsed * 2 + (i / 6) * Math.PI * 2;
          const radius = 50 + Math.sin(elapsed * 3) * 30;
          const px = centerX + Math.cos(angle) * radius;
          const py = centerY - 50 + Math.sin(angle) * radius * 0.5;
          
          particlesRef.current.push(createParticle(
            px, py, "magic", state.colors,
            { vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2 - 1, size: 4 + Math.random() * 6, maxLife: 0.8, decay: 0.02 }
          ));
        }
        
        // Glitter
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push(createParticle(
            Math.random() * width, Math.random() * height * 0.7, "sparkle", ["#FFFFFF", "#FFD700", "#FF69B4"],
            { vx: 0, vy: 1, size: 2 + Math.random() * 3, maxLife: 0.6, decay: 0.025 }
          ));
        }
      }
      // === SMOKE / FOG ===
      else if (state.simType.includes("smoke") || state.simType.includes("fog") || state.simType.includes("steam")) {
        drawGround();
        
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push(createParticle(
            centerX + (Math.random() - 0.5) * 100, groundY - 20,
            "smoke", state.colors,
            { vy: -1 - Math.random() * 2, vx: (Math.random() - 0.5) * 1, size: 20 + Math.random() * 30, maxLife: 2, decay: 0.006 }
          ));
        }
      }
      // === BALL BOUNCE / PROJECTILE ===
      else if (state.simType.includes("ball") || state.simType.includes("bounce") || state.simType.includes("projectile")) {
        drawGround();
        
        if (!state.ball) {
          state.ball = { x: 100, y: 100, vx: 6, vy: 0 };
        }
        
        state.ball.vy += gravity * 0.12;
        state.ball.x += state.ball.vx;
        state.ball.y += state.ball.vy;
        
        // Bounce
        if (state.ball.y + objectSize > groundY) {
          state.ball.y = groundY - objectSize;
          state.ball.vy *= -(parameters.elasticity || 0.75);
          state.ball.vx *= 0.95;
          
          for (let i = 0; i < 8; i++) {
            particlesRef.current.push(createParticle(
              state.ball.x, groundY, "dust", getColors("dust"),
              { vx: (Math.random() - 0.5) * 4, vy: -2 - Math.random() * 3, size: 4, maxLife: 0.6 }
            ));
          }
        }
        
        if (state.ball.x < objectSize || state.ball.x > width - objectSize) {
          state.ball.vx *= -0.9;
        }
        
        const ballGradient = ctx.createRadialGradient(state.ball.x - 5, state.ball.y - 5, 0, state.ball.x, state.ball.y, objectSize);
        ballGradient.addColorStop(0, "#FFF");
        ballGradient.addColorStop(0.5, state.colors[0]);
        ballGradient.addColorStop(1, state.colors[1] || state.colors[0]);
        ctx.shadowBlur = 10;
        ctx.shadowColor = state.colors[0];
        ctx.fillStyle = ballGradient;
        ctx.beginPath();
        ctx.arc(state.ball.x, state.ball.y, objectSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // === ROCK FALL (DEFAULT) ===
      else {
        drawGround();
        
        if (!state.rock) {
          state.rock = { x: centerX, y: -50, vy: 0, rotation: 0 };
        }
        
        if (state.phase === "active") {
          state.rock.vy += gravity * 0.18;
          state.rock.y += state.rock.vy;
          state.rock.rotation += 0.04;
          
          // Trail
          if (Math.random() > 0.5) {
            particlesRef.current.push(createParticle(
              state.rock.x + (Math.random() - 0.5) * objectSize,
              state.rock.y, "trail", getColors("dust"),
              { vx: (Math.random() - 0.5) * 2, vy: -1, size: 4, maxLife: 0.4, decay: 0.04 }
            ));
          }
          
          if (state.rock.y + objectSize > groundY) {
            state.phase = "impact";
            
            // Impact particles
            for (let i = 0; i < particleCount; i++) {
              const angle = Math.random() * Math.PI - Math.PI;
              const speed = 3 + Math.random() * 10;
              particlesRef.current.push(createParticle(
                state.rock.x, groundY - 5,
                Math.random() > 0.6 ? "debris" : "dust",
                state.colors,
                { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2, size: 4 + Math.random() * 10, maxLife: 1.2, decay: 0.012, rotation: Math.random() * Math.PI * 2 }
              ));
            }
            
            // Sparks
            for (let i = 0; i < 20; i++) {
              particlesRef.current.push(createParticle(
                state.rock.x, groundY - 5, "spark", getColors("sparks"),
                { vx: (Math.random() - 0.5) * 12, vy: -8 - Math.random() * 10, size: 2, maxLife: 0.6, decay: 0.025 }
              ));
            }
          } else {
            // Draw rock
            ctx.save();
            ctx.translate(state.rock.x, state.rock.y);
            ctx.rotate(state.rock.rotation);
            
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, objectSize);
            gradient.addColorStop(0, state.colors[0]);
            gradient.addColorStop(0.7, state.colors[1] || state.colors[0]);
            gradient.addColorStop(1, state.colors[2] || state.colors[0]);
            
            ctx.shadowBlur = 15;
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2;
              const radius = objectSize * (0.7 + Math.sin(i * 2.5) * 0.3);
              const px = Math.cos(angle) * radius;
              const py = Math.sin(angle) * radius;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
          }
        }
      }

      // === UPDATE AND DRAW PARTICLES ===
      particlesRef.current = particlesRef.current.filter(p => {
        // Special physics for specific types
        if (p.type === "snow") {
          p.vx = Math.sin(elapsed * 2 + p.x * 0.01) * 0.8;
        } else if (p.type === "matter" && p.targetX !== undefined) {
          // Attract to black hole
          const dx = p.targetX - p.x;
          const dy = p.targetY! - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 10) {
            p.vx += (dx / dist) * 0.5;
            p.vy += (dy / dist) * 0.5;
          }
          p.vx *= 0.98;
          p.vy *= 0.98;
        } else if (p.type !== "magic" && p.type !== "sparkle" && p.type !== "electron" && p.type !== "photon") {
          p.vy += gravity * 0.04;
        }
        
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay || 0.015;
        if (p.rotation !== undefined) p.rotation += 0.05;
        
        if (p.life <= 0) return false;
        if (p.y > height + 50) return false;
        
        // Draw based on type
        ctx.globalAlpha = p.life * (p.opacity || 1);
        
        if (p.type === "smoke" || p.type === "dust" || p.type === "steam" || p.type === "co2") {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * p.life);
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (2 - p.life), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "fire" || p.type === "lava" || p.type === "plasma") {
          ctx.shadowBlur = 15;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (p.type === "spark" || p.type === "magic" || p.type === "sparkle" || p.type === "photon" || p.type === "energy" || p.type === "neutron" || p.type === "electron" || p.type === "alpha" || p.type === "beta" || p.type === "gamma") {
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          if (p.type === "magic" || p.type === "sparkle") {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x - p.size * 2, p.y);
            ctx.lineTo(p.x + p.size * 2, p.y);
            ctx.moveTo(p.x, p.y - p.size * 2);
            ctx.lineTo(p.x, p.y + p.size * 2);
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
        } else if (p.type === "rain") {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx, p.y + 15);
          ctx.stroke();
        } else if (p.type === "snow") {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.5)";
          ctx.lineWidth = 0.5;
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + (p.rotation || 0);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + Math.cos(angle) * p.size * 1.5, p.y + Math.sin(angle) * p.size * 1.5);
            ctx.stroke();
          }
        } else if (p.type === "debris" || p.type === "filing") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.7);
          ctx.restore();
        } else if (p.type === "bubble") {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "star_matter" || p.type === "matter") {
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (p.type === "trail") {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life * 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        
        ctx.globalAlpha = 1;
        return true;
      });

      // Continue animation
      if (elapsed < duration || particlesRef.current.length > 0 || (state.rock && state.phase === "active") || (state.ball) || (state.pendulum) || (state.spring) || (state.balls) || (state.diffusionParticles)) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, simulationType, parameters, getColors, createParticle]);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-background to-muted/20 flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      {!isRunning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <div className="w-8 h-8 rounded-full bg-primary/40" />
            </div>
            <p className="text-muted-foreground text-sm">Enter a command to start</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationCanvas;
