import { Suspense, useState, useEffect, useMemo } from 'react';
import Scene3D from './Scene3D';
import DataHUD, { DataMetric } from './DataHUD';
import { useLanguage } from "@/contexts/LanguageContext";

// Import all 3D simulations
import PendulumSimulation from './simulations/PendulumSimulation';
import OrbitalSimulation from './simulations/OrbitalSimulation';
import BlackHoleSimulation from './simulations/BlackHoleSimulation';
import MolecularSimulation from './simulations/MolecularSimulation';
import CollisionSimulation from './simulations/CollisionSimulation';
import WaveSimulation from './simulations/WaveSimulation';
import GravitySimulation from './simulations/GravitySimulation';
import NuclearFissionSimulation from './simulations/NuclearFissionSimulation';
import ProjectileSimulation from './simulations/ProjectileSimulation';
import SpringSimulation from './simulations/SpringSimulation';
import AtomicModelSimulation from './simulations/AtomicModelSimulation';
import DNASimulation from './simulations/DNASimulation';
import FrictionSimulation from './simulations/FrictionSimulation';
import InclinedPlaneSimulation from './simulations/InclinedPlaneSimulation';
import PulleySimulation from './simulations/PulleySimulation';
import LeverSimulation from './simulations/LeverSimulation';
import GyroscopeSimulation from './simulations/GyroscopeSimulation';
import CentripetalSimulation from './simulations/CentripetalSimulation';
import MagneticFieldSimulation from './simulations/MagneticFieldSimulation';
import ElectricFieldSimulation from './simulations/ElectricFieldSimulation';
import HeatTransferSimulation from './simulations/HeatTransferSimulation';
import PhaseChangeSimulation from './simulations/PhaseChangeSimulation';
import DoubleslitSimulation from './simulations/DoubleslitSimulation';
import SupernovaSimulation from './simulations/SupernovaSimulation';
import LightRefractionSimulation from './simulations/LightRefractionSimulation';
import ElectricCircuitSimulation from './simulations/ElectricCircuitSimulation';
import CellDivisionSimulation from './simulations/CellDivisionSimulation';
import TornadoSimulation from './simulations/TornadoSimulation';
import VolcanoSimulation from './simulations/VolcanoSimulation';
import BuoyancySimulation from './simulations/BuoyancySimulation';
import QuantumTunnelingSimulation from './simulations/QuantumTunnelingSimulation';
import ChemicalReactionSimulation from './simulations/ChemicalReactionSimulation';
import BrownianMotionSimulation from './simulations/BrownianMotionSimulation';
import DopplerSimulation from './simulations/DopplerSimulation';
import GalaxySimulation from './simulations/GalaxySimulation';
import EMWaveSimulation from './simulations/EMWaveSimulation';
import StateOfMatterSimulation from './simulations/StateOfMatterSimulation';
import GearSimulation from './simulations/GearSimulation';
import CellStructureSimulation from './simulations/CellStructureSimulation';
import AirPressure from './simulations/AirPressure';
import ChemistryLab from './simulations/chemistrySimulation';
import PeriodicTableSimulation from './simulations/PeriodicTableSimulation';
import HumanAnatomySimulation from './simulations/HumanAnatomySimulation';


interface SimulationParameters {
  gravity?: number;
  mass?: number;
  velocity?: number;
  angle?: number;
  length?: number;
  rotation?: number;
  particleCount?: number;
  color?: string;
  size?: number;
  duration?: number;
  elasticity?: number;
  intensity?: number;
}

interface SimulationCanvas3DProps {
  isRunning: boolean;
  simulationType: string;
  parameters?: SimulationParameters;
}

// Map simulation types to 3D components
const getSimulation3D = (simType: string, parameters: SimulationParameters) => {
  const type = simType.toLowerCase().replace(/[- ]/g, '_');
  console.log("3D Simulation Mapping - Input:", simType, "Normalized:", type);


  // Physics - Mechanics (most specific first)
  if (type.includes('pendulum') || type.includes('lavjerresi')) return <PendulumSimulation gravity={parameters.gravity} length={parameters.length} />;
  if (type.includes('spring') || type.includes('harmonic') || type.includes('oscillat') || type.includes('hooke') || type.includes('susta')) return <SpringSimulation />;
  if (type.includes('projectile') || type.includes('parabolic') || type.includes('trajectory') || type.includes('simulim_i_hedhjes_se_nje_trupi') || type.includes('hedhja_e_trupit') || type.includes('projektili')) return <ProjectileSimulation />;
  if (type.includes('collision') || type.includes('momentum') || type.includes('newton_cradle') || type.includes('elastic') || type.includes('inelastic') || type.includes('goditja') || type.includes('impulsi')) return <CollisionSimulation />;
  if (type.includes('friction') || type.includes('sliding') || type.includes('fërkimi')) return <FrictionSimulation />;
  if (type.includes('inclined') || type.includes('ramp') || type.includes('incline') || type.includes('plani_i_pjerrët')) return <InclinedPlaneSimulation />;
  if (type.includes('pulley') || type.includes('atwood') || type.includes('telif') || type.includes('puli')) return <PulleySimulation />;
  if (type.includes('lever') || type.includes('fulcrum') || type.includes('torque') || type.includes('leva')) return <LeverSimulation />;
  if (type.includes('gyroscope') || type.includes('angular_momentum') || type.includes('zhiroskopi')) return <GyroscopeSimulation />;
  if (type.includes('centripetal') || type.includes('circular_motion') || type.includes('centrifugal') || type.includes('forca_qendërsynuese')) return <CentripetalSimulation />;
  if (type.includes('buoyancy') || type.includes('archimedes') || type.includes('floating') || type.includes('sinking') || type.includes('notimi')) return <BuoyancySimulation />;
  if (type.includes('states_of_matter') || type.includes('state_of_matter') || type.includes('solid_liquid') || type.includes('liquid_gas') || (type.includes('matter') && (type.includes('state') || type.includes('phase'))) || type.includes('gjendjet_e_lëndës')) return <StateOfMatterSimulation />;
  if (type.includes('gravity') || type.includes('free_fall') || type.includes('weight') || type.includes('g_force') || type.includes('fall') || type.includes('graviteti') || type.includes('rendesa') || type.includes('rëndesa') || type.includes('rënia_e_lirë') || type.includes('comparison')) return <GravitySimulation />;
  if (type.includes('pressure') || type.includes('gas_law') || type.includes('piston') || type.includes('boyle') || type.includes('atmosphere') || type.includes('presioni')) return <AirPressure />;

  // Astrophysics
  if (type.includes('black_hole') || type.includes('gravity_well') || type.includes('quasar') || type.includes('event_horizon') || type.includes('vrima_e_zeze'))
    return <BlackHoleSimulation mass={parameters.mass} rotation={parameters.rotation} />;
  if (type.includes('supernova') || type.includes('star_explosion') || type.includes('neutron_star')) return <SupernovaSimulation />;
  if (type.includes('galaxy') || type.includes('spiral') || type.includes('milky') || type.includes('nebula') || type.includes('galaktika')) return <GalaxySimulation />;
  if (type.includes('orbit') || type.includes('planet') || type.includes('satellite') || type.includes('solar_system') || type.includes('earth_orbit') || type.includes('moon_orbit') || type.includes('kepler') || type.includes('orbita') || type.includes('sistemi_diellor')) return <OrbitalSimulation />;

  // Waves & Optics (check specific before generic 'wave')
  if (type.includes('double_slit') || type.includes('wave_particle') || type.includes('slit') || type.includes('eksperimenti_i_dy_çarjeve')) return <DoubleslitSimulation />;
  if (type.includes('refraction') || type.includes('snell') || type.includes('lens') || type.includes('prism') || type.includes('përthyerja')) return <LightRefractionSimulation />;
  if (type.includes('doppler') || type.includes('efekti_dopler')) return <DopplerSimulation />;
  if (type.includes('electromagnetic') || type.includes('em_wave') || type.includes('light_wave') || type.includes('transverse') || type.includes('vala_elektromagnetike')) return <EMWaveSimulation />;
  if (type.includes('wave') || type.includes('interference') || type.includes('diffraction') || type.includes('standing') || type.includes('vala')) return <WaveSimulation />;

  // Electromagnetism
  if (type.includes('magnetic') || type.includes('magnet') || type.includes('iron_filing') || type.includes('compass') || type.includes('fusha_magnetike')) return <MagneticFieldSimulation />;
  if (type.includes('electric_field') || type.includes('coulomb') || type.includes('charge') || type.includes('electrostatic') || type.includes('fusha_elektrike')) return <ElectricFieldSimulation />;
  if (type.includes('circuit') || type.includes('current') || type.includes('ohm') || type.includes('resistor') || type.includes('voltage') || type.includes('qarku_elektrik') || type.includes('rryma_elektrike')) return <ElectricCircuitSimulation />;

  // Thermodynamics
  if (type.includes('heat') || type.includes('conduction') || type.includes('convection') || type.includes('radiation_heat') || type.includes('thermal') || type.includes('nxehtësia')) return <HeatTransferSimulation />;

  if (type.includes('phase') || type.includes('melting') || type.includes('boiling') || type.includes('freezing') || type.includes('evaporation') || type.includes('condensation') || type.includes('sublimation') || type.includes('ndryshimi_i_gjendjes')) return <PhaseChangeSimulation />;

  // Mechanical Systems
  if (type.includes('gear') || type.includes('cog') || type.includes('transmission') || type.includes('energy_transfer') || type.includes('dhëmbëzori')) return <GearSimulation />;

  // Nuclear & Quantum
  if (type.includes('fission') || (type.includes('nuclear') && !type.includes('fusion')) || type.includes('reactor') || type.includes('chain_reaction') || type.includes('fisioni')) return <NuclearFissionSimulation />;
  if (type.includes('quantum') || type.includes('tunnel') || type.includes('uncertainty') || type.includes('superposition') || type.includes('tunelimi_kuantik')) return <QuantumTunnelingSimulation />;
  if (type.includes('atomic') || type.includes('bohr') || type.includes('electron_shell') || type.includes('electron_cloud') || type.includes('electron_orbit') || type.includes('modeli_atomik')) return <AtomicModelSimulation />;

  // Chemistry
  if (type.includes('chemistry') || type.includes('chem') || type.includes('lab') || type.includes('experiment') || type.includes('expe') || type.includes('beaker') || type.includes('flask') || type.includes('laboratori') || type.includes('kimia')) return <ChemistryLab />;
  if (type.includes('periodic') || type.includes('table') || type.includes('element') || type.includes('tabela_periodike')) return <PeriodicTableSimulation />;



  if (type.includes('reaction') || type.includes('combustion') || type.includes('exothermic') || type.includes('endothermic') || type.includes('synthesis') || type.includes('decomposition') || type.includes('reaksioni')) return <ChemicalReactionSimulation />;
  if (type.includes('brownian') || type.includes('diffusion') || type.includes('random_motion') || type.includes('lëvizja_brauniane')) return <BrownianMotionSimulation />;
  if (type.includes('molecular') || type.includes('molecule') || type.includes('bond') || type.includes('covalent') || type.includes('ionic') || type.includes('molekula')) return <MolecularSimulation />;

  // Biology
  if (type.includes('dna') || type.includes('gene') || type.includes('helix') || type.includes('replication') || type.includes('adn')) return <DNASimulation />;
  if (type.includes('cell_structure') || type.includes('organelle') || type.includes('nucleus') || type.includes('mitochondria') || type.includes('cytoplasm') || type.includes('struktura_e_qelizës')) return <CellStructureSimulation />;
  if (type.includes('cell') || type.includes('mitosis') || type.includes('meiosis') || type.includes('division') || type.includes('ndarja_qelizore')) return <CellDivisionSimulation />;
  if (type.includes('anatomy') || type.includes('human') || type.includes('body') || type.includes('skelet') || type.includes('organ') || type.includes('anatomia') || type.includes('njeriu') || type.includes('trupi_i_njeriut')) return <HumanAnatomySimulation />;

  // Weather & Geology
  if (type.includes('tornado') || type.includes('hurricane') || type.includes('cyclone') || type.includes('vortex') || type.includes('tornadoja')) return <TornadoSimulation />;
  if (type.includes('volcano') || type.includes('eruption') || type.includes('lava') || type.includes('magma') || type.includes('vullkani')) return <VolcanoSimulation />;

  // Fallback - use the most visually interesting default
  console.log(`No specific 3D simulation for type: ${type}, using pendulum fallback`);
  return <PendulumSimulation gravity={parameters.gravity} />;
};

export const SimulationCanvas3D = ({
  isRunning,
  simulationType,
  parameters = {}
}: SimulationCanvas3DProps) => {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<DataMetric[]>([]);

  // Memoize the 3D simulation to prevent re-rendering when metrics update
  // We move this BEFORE the early return to follow React Hook rules
  const simulationComponent = useMemo(() => {
    if (!isRunning || !simulationType) return null;
    return getSimulation3D(simulationType, parameters);
  }, [simulationType, parameters, isRunning]);

  // Real-time data simulation for the HUD
  useEffect(() => {
    if (!isRunning || !simulationType) return;

    const interval = setInterval(() => {
      const type = simulationType.toLowerCase();

      if (type.includes('pendulum')) {
        const vel = Math.abs(Math.sin(Date.now() / 500) * 2.5 * (parameters.gravity || 9.8) / 9.8);
        setMetrics([
          { label: 'Angular Velocity', value: vel, unit: 'rad/s', icon: 'zap', trend: [1.2, 1.5, 2.1, 1.8, 1.4, 1.9, 2.3] },
          { label: 'Angle', value: Math.sin(Date.now() / 500) * 45, unit: 'deg', icon: 'activity' },
          { label: 'Gravity', value: parameters.gravity || 9.8, unit: 'm/s²', icon: 'info' }
        ]);
      } else if (type.includes('black_hole')) {
        const bhMass = parameters.mass || 4.1;
        setMetrics([
          { label: 'Singularity Mass', value: bhMass * 1000000, unit: 'M☉', icon: 'zap' },
          { label: 'Photon Radius', value: 3 * bhMass, unit: 'Gm', icon: 'activity', trend: [12.4, 12.5, 12.4, 12.3, 12.4, 12.5] },
          { label: 'Gravity Pull', value: (bhMass / 4.1) * 9.8e12, unit: 'm/s²', icon: 'info' }
        ]);
      } else if (type.includes('projectile')) {
        setMetrics([
          { label: 'Velocity X', value: parameters.velocity || 15.2, unit: 'm/s', icon: 'zap' },
          { label: 'Velocity Y', value: (parameters.gravity || 9.8) - (Date.now() % 2000) / 100, unit: 'm/s', icon: 'activity' },
          { label: 'Distance', value: (Date.now() % 5000) / 50, unit: 'm', icon: 'info' }
        ]);
      } else {
        // Generic fallback data
        setMetrics([
          { label: 'Sim Status', value: 'Active', icon: 'info' },
          { label: 'Time Scale', value: 1.0, unit: 'x', icon: 'clock' },
          { label: 'Gravity', value: parameters.gravity || 9.8, unit: 'm/s²', icon: 'zap' }
        ]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, simulationType]);

  if (!isRunning || !simulationType) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#050505]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          </div>
          <p className="text-white/40 uppercase tracking-widest text-[10px]">{t('canvas.empty') || 'Initializing Laboratory...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#050505] rounded-2xl overflow-hidden border border-white/5">
      {/* Data HUD Overlay */}
      <DataHUD
        metrics={metrics}
        title={t(`simulations.${simulationType}`) || 'Simulation Analytics'}
        simulationType={simulationType}
      />

      <Scene3D showStars={true}>
        <Suspense fallback={
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#8B5CF6" wireframe />
          </mesh>
        }>
          {simulationComponent}
        </Suspense>
      </Scene3D>
    </div>
  );
};

export default SimulationCanvas3D;
