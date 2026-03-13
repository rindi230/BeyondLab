import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { command } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing simulation command:", command);

    const systemPrompt = `You are a scientific simulation interpreter for BeyondLab, a virtual AI science laboratory.
Analyze the user's natural language request and return structured simulation parameters.

AVAILABLE SIMULATION TYPES - CHOOSE THE MOST SPECIFIC MATCH:

=== CLASSICAL MECHANICS ===
- "rock_fall" - rocks, meteors, asteroids falling and impacting
- "ball_bounce" - bouncing balls, projectiles, elastic collisions
- "pendulum" - swinging pendulums, periodic motion
- "spring" - spring oscillation, harmonic motion, Hooke's law
- "collision" - two objects colliding, momentum conservation
- "projectile" - projectile motion, parabolic trajectory
- "friction" - friction demonstration, sliding objects
- "inclined_plane" - objects on ramps, acceleration
- "pulley" - pulley systems, mechanical advantage
- "lever" - lever and fulcrum mechanics
- "gyroscope" - spinning gyroscope, angular momentum
- "centripetal" - circular motion, centripetal force
- "momentum" - momentum transfer, Newton's cradle
- "free_fall" - objects in free fall, terminal velocity
- "resonance" - resonance frequency, vibration amplification

=== HIGH SCHOOL PHYSICS - MECHANICS ===
- "moon_orbit" - moon orbiting Earth, gravitational orbit
- "earth_orbit" - Earth orbiting Sun, Kepler's laws
- "satellite_orbit" - satellite in orbit, geostationary
- "gravity_comparison" - object falling on different planets (Moon, Mars, Jupiter)
- "newton_cradle" - Newton's cradle, momentum conservation
- "elastic_collision" - perfectly elastic collision between two balls
- "inelastic_collision" - inelastic collision, energy loss
- "kinetic_energy" - kinetic energy demonstration KE = ½mv²
- "potential_energy" - gravitational potential energy PE = mgh
- "work_energy" - work-energy theorem demonstration
- "conservation_energy" - energy conservation roller coaster
- "simple_harmonic" - simple harmonic motion oscillator
- "damped_oscillation" - damped harmonic oscillator
- "forced_oscillation" - forced vibration, resonance
- "circular_motion" - uniform circular motion demo
- "angular_momentum" - angular momentum conservation (ice skater)
- "torque" - torque and rotation demonstration
- "center_mass" - center of mass motion
- "parabolic_motion" - projectile parabolic trajectory with vectors
- "terminal_velocity" - skydiver reaching terminal velocity

=== HIGH SCHOOL PHYSICS - FORCES ===
- "newtons_first" - Newton's first law inertia demo
- "newtons_second" - F=ma demonstration
- "newtons_third" - action-reaction pairs
- "weight_vs_mass" - weight on different planets
- "normal_force" - normal force on surfaces
- "tension_force" - tension in ropes and strings
- "spring_force" - spring force F=-kx
- "air_resistance" - air resistance vs vacuum fall
- "gravitational_field" - gravitational field lines around Earth
- "g_force" - g-force in acceleration/deceleration

=== HIGH SCHOOL PHYSICS - FLUIDS ===
- "archimedes" - Archimedes principle, buoyancy
- "floating_sinking" - objects floating and sinking
- "hydraulic_press" - hydraulic press Pascal's law
- "pressure_depth" - pressure increases with depth
- "bernoulli_demo" - Bernoulli principle airplane wing

=== WAVES & OPTICS ===
- "wave_interference" - wave patterns, constructive/destructive interference
- "light_refraction" - light bending through media, Snell's law
- "light_reflection" - mirror reflection, angles of incidence
- "rainbow" - light dispersion, spectrum formation
- "diffraction" - wave diffraction through slits
- "doppler" - Doppler effect, frequency shift
- "sound_wave" - sound wave propagation
- "standing_wave" - standing waves, nodes and antinodes
- "lens" - convex/concave lens focusing light
- "prism" - prism splitting white light
- "laser" - coherent laser beam, photon emission
- "hologram" - holographic interference patterns
- "polarization" - light polarization
- "fiber_optic" - total internal reflection
- "transverse_wave" - transverse wave demonstration
- "longitudinal_wave" - longitudinal wave (sound) demo
- "wave_reflection" - wave reflecting off barrier
- "slinky_wave" - slinky wave demonstration

=== ELECTROMAGNETISM ===
- "magnetic_field" - magnetic field lines, iron filings
- "electric_field" - electric field visualization
- "electromagnetic_wave" - EM wave propagation
- "electric_current" - current flow, electron movement
- "capacitor" - capacitor charging/discharging
- "inductor" - magnetic field in coils
- "transformer" - electromagnetic induction
- "motor" - electric motor rotation
- "generator" - electromagnetic generator
- "lightning" - electrical discharge, plasma
- "plasma" - plasma state, ionized gas
- "tesla_coil" - high voltage arcs
- "electromagnetic_induction" - Faraday's law
- "eddy_current" - eddy current braking
- "coulombs_law" - electrostatic attraction/repulsion
- "electric_circuit" - simple circuit with current flow
- "parallel_circuit" - parallel circuit demo
- "series_circuit" - series circuit demo
- "electromagnet" - electromagnet field
- "lorentz_force" - charged particle in magnetic field

=== THERMODYNAMICS ===
- "heat_transfer" - conduction, convection, radiation
- "convection" - fluid convection currents
- "conduction" - heat through solid
- "radiation_heat" - thermal radiation
- "phase_change" - solid/liquid/gas transitions
- "melting" - solid to liquid
- "boiling" - liquid to gas with bubbles
- "freezing" - liquid to solid
- "sublimation" - solid to gas
- "condensation" - gas to liquid
- "evaporation" - surface evaporation
- "entropy" - entropy increase, disorder
- "thermal_expansion" - material expansion
- "pressure" - gas pressure, collisions
- "ideal_gas" - ideal gas law
- "kinetic_theory" - gas particles random motion
- "heat_engine" - heat engine cycle
- "absolute_zero" - particles slowing at low temp

- "air_pressure" - air pressure demonstration, Boyle's law, piston compression
- "pressure" - gas pressure, collisions
- "ideal_gas" - ideal gas law

=== NUCLEAR & ATOMIC PHYSICS ===
- "nuclear_fission" - atom splitting, chain reaction
- "nuclear_fusion" - atoms combining, energy release
- "radioactive_decay" - alpha/beta/gamma emission
- "alpha_decay" - alpha particle emission
- "beta_decay" - beta particle emission
- "gamma_ray" - gamma radiation
- "half_life" - radioactive decay over time
- "neutron_capture" - neutron absorption
- "atomic_model" - Bohr model, electron orbits
- "electron_cloud" - probability cloud
- "isotope" - isotope transformation
- "nuclear_reactor" - controlled fission
- "particle_accelerator" - accelerated particles
- "antimatter" - matter-antimatter annihilation

=== QUANTUM MECHANICS ===
- "quantum_tunneling" - particle through barrier
- "wave_particle_duality" - photon/electron dual nature
- "superposition" - quantum superposition states
- "entanglement" - quantum entanglement
- "uncertainty" - Heisenberg uncertainty
- "double_slit" - double-slit experiment
- "photon_emission" - photon release
- "electron_jump" - energy level transition
- "spin" - particle spin states
- "quantum_field" - field fluctuations

=== ASTROPHYSICS & COSMOLOGY ===
- "orbital_motion" - planets/satellites orbiting
- "gravity_well" - gravitational potential
- "black_hole" - black hole accretion
- "supernova" - star explosion
- "neutron_star" - ultra-dense star
- "solar_flare" - sun plasma ejection
- "comet" - comet with tail
- "asteroid_belt" - orbiting asteroids
- "galaxy" - spiral galaxy rotation
- "big_bang" - universe expansion
- "dark_matter" - dark matter effects
- "gravitational_wave" - spacetime ripples
- "pulsar" - rotating neutron star
- "quasar" - active galactic nucleus
- "red_giant" - expanding star
- "white_dwarf" - stellar remnant
- "nebula" - gas cloud formation
- "meteor_shower" - multiple meteors
- "eclipse" - solar/lunar eclipse
- "tidal_force" - tidal effects
- "solar_system" - complete solar system with planets

=== HIGH SCHOOL CHEMISTRY - REACTIONS ===
- "reaction" - generic chemical reaction
- "combustion" - burning, oxidation
- "explosion_chem" - rapid exothermic reaction
- "acid_base" - neutralization
- "oxidation" - oxidation, rust
- "reduction" - reduction reaction
- "precipitation" - precipitate forming
- "decomposition" - compound breaking
- "synthesis" - elements combining
- "catalysis" - catalyst reaction
- "electrolysis" - electric splitting
- "corrosion" - metal degradation
- "photosynthesis" - light energy conversion
- "fermentation" - anaerobic process
- "exothermic" - heat releasing reaction
- "endothermic" - heat absorbing reaction
- "rate_of_reaction" - reaction rate factors
- "activation_energy" - energy barrier demo
- "reversible_reaction" - equilibrium reaction
- "single_replacement" - single replacement reaction
- "double_replacement" - double replacement reaction

=== HIGH SCHOOL CHEMISTRY - MOLECULAR ===
- "molecular_bond" - covalent bonds forming
- "ionic_bond" - electron transfer
- "hydrogen_bond" - hydrogen bonding
- "van_der_waals" - weak forces
- "crystal_growth" - crystal lattice
- "dissolution" - solid dissolving
- "diffusion" - particles spreading
- "osmosis" - membrane transport
- "brownian_motion" - random movement
- "molecular_vibration" - molecule movement
- "isomer" - molecular rearrangement
- "chirality" - mirror molecules
- "electron_shell" - electron configuration
- "valence_electrons" - outer shell electrons
- "ionic_compound" - ionic lattice structure
- "metallic_bonding" - sea of electrons
- "polar_molecule" - dipole moment
- "lewis_structure" - electron dot diagram

=== CHEMISTRY - STATES ===
- "bubbling" - gas bubbles in liquid
- "saturation" - solution saturation
- "supersaturation" - crystallizing solution
- "emulsion" - oil/water mixing
- "colloid" - colloidal suspension
- "gel" - gel formation
- "foam" - foam bubbles
- "aerosol" - particles in air
- "states_of_matter" - solid liquid gas comparison
- "plasma_state" - fourth state of matter

=== FLUID DYNAMICS ===
- "water_flood" - water rising, flooding
- "rain" - rain falling
- "tsunami" - massive wave
- "whirlpool" - rotating vortex
- "laminar_flow" - smooth fluid
- "turbulent_flow" - chaotic fluid
- "viscosity" - thick/thin fluid
- "buoyancy" - floating/sinking
- "bernoulli" - pressure in flow
- "cavitation" - bubble collapse
- "siphon" - siphon flow
- "hydraulic" - hydraulic pressure
- "surface_tension" - water surface
- "capillary" - liquid rising
- "vortex" - rotating column

=== WEATHER ===
- "tornado" - rotating wind funnel
- "hurricane" - large storm system
- "snow" - snowfall
- "hail" - ice pellets
- "fog" - mist
- "cloud_formation" - cloud condensation
- "aurora" - northern lights
- "wind" - air movement
- "thunderstorm" - storm with lightning

=== GEOLOGY ===
- "volcano" - volcanic eruption
- "earthquake" - ground shaking
- "geyser" - water/steam eruption
- "landslide" - mass movement
- "erosion" - wearing away
- "sediment" - sediment layers
- "plate_tectonics" - continental drift
- "magma_chamber" - molten rock
- "stalactite" - cave formation

=== BIOLOGY ===
- "cell_division" - mitosis
- "dna_replication" - DNA copying
- "protein_folding" - protein structure
- "virus" - viral structure
- "bacteria" - bacterial reproduction
- "neuron" - nerve signal
- "blood_flow" - circulation
- "enzyme" - enzyme interaction
- "bioluminescence" - biological light

=== SPECIAL EFFECTS ===
- "fire" - flames, burning
- "smoke" - rising smoke
- "explosion" - explosive blast
- "magic" - magical sparkles
- "portal" - interdimensional gateway
- "force_field" - energy barrier
- "teleport" - teleportation
- "antigravity" - reverse gravity
- "energy_beam" - focused energy
- "shield" - protective dome
- "vaporize" - matter to energy
- "materialize" - energy to matter

COLOR OPTIONS: orange, red, blue, white, gray, green, purple, yellow, cyan, pink, gold

Return ONLY valid JSON:
{
  "simulationType": "exact_type_from_above",
  "parameters": {
    "gravity": 9.8,
    "particleCount": 150,
    "color": "appropriate_color",
    "size": 25,
    "duration": 8,
    "velocity": 100,
    "intensity": 1
  },
  "explanation": "2-4 sentence scientific explanation with formulas or laws."
}

PARAMETER HINTS:
- Nuclear/quantum: high intensity (1.5-2), cyan/purple/white
- Chemistry: medium particles (100-200), reaction-specific colors
- Astrophysics: larger scale, slower, purple/blue/gold
- Thermodynamics: warm colors (red/orange/yellow)
- Fluids: high particles (200-400), blue/white
- High school demos: clear visuals, educational focus
- Orbital mechanics: smooth motion, accurate scales`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Interpret this and return JSON only: "${command}"` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI raw response:", JSON.stringify(data));

    const content = data.choices?.[0]?.message?.content || "";
    
    let jsonStr = content.trim();
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }
    
    const simulationData = JSON.parse(jsonStr);
    console.log("Parsed simulation:", simulationData);

    return new Response(JSON.stringify(simulationData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Simulation error:", error);
    
    const fallback = {
      simulationType: "rock_fall",
      parameters: { gravity: 9.8, color: "gray", size: 25, particleCount: 150, duration: 8 },
      explanation: "A falling object accelerates due to gravity (g = 9.8 m/s²). Upon impact, kinetic energy converts to heat, sound, and mechanical deformation."
    };
    
    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
