export interface ElementData {
    atomicNumber: number;
    symbol: string;
    name: string;
    group: number; // 1-18
    period: number; // 1-7
    category: 'alkali' | 'alkaline-earth' | 'transition' | 'post-transition' | 'metalloid' | 'nonmetal' | 'halogen' | 'noble-gas' | 'lanthanide' | 'actinide' | 'unknown';
    mass: number;
    electronConfiguration: string;
    color: string; // Hex color for visualization
    description: string;
}

const initialElements: ElementData[] = [
    { atomicNumber: 1, symbol: 'H', name: 'Hydrogen', group: 1, period: 1, category: 'nonmetal', mass: 1.008, electronConfiguration: '1s1', color: '#FFFFFF', description: 'Lightest element.' },
    { atomicNumber: 2, symbol: 'He', name: 'Helium', group: 18, period: 1, category: 'noble-gas', mass: 4.0026, electronConfiguration: '1s2', color: '#D9FFFF', description: 'Inert gas.' },
    { atomicNumber: 3, symbol: 'Li', name: 'Lithium', group: 1, period: 2, category: 'alkali', mass: 6.94, electronConfiguration: '[He] 2s1', color: '#CC80FF', description: 'Lightest metal.' },
    { atomicNumber: 4, symbol: 'Be', name: 'Beryllium', group: 2, period: 2, category: 'alkaline-earth', mass: 9.0122, electronConfiguration: '[He] 2s2', color: '#C2FF00', description: 'Rare lightweight metal.' },
    { atomicNumber: 5, symbol: 'B', name: 'Boron', group: 13, period: 2, category: 'metalloid', mass: 10.81, electronConfiguration: '[He] 2s2 2p1', color: '#FFB5B5', description: 'Metalloid.' },
    { atomicNumber: 6, symbol: 'C', name: 'Carbon', group: 14, period: 2, category: 'nonmetal', mass: 12.011, electronConfiguration: '[He] 2s2 2p2', color: '#909090', description: 'Basis of life.' },
    { atomicNumber: 7, symbol: 'N', name: 'Nitrogen', group: 15, period: 2, category: 'nonmetal', mass: 14.007, electronConfiguration: '[He] 2s2 2p3', color: '#3050F8', description: 'Atmosphere component.' },
    { atomicNumber: 8, symbol: 'O', name: 'Oxygen', group: 16, period: 2, category: 'nonmetal', mass: 15.999, electronConfiguration: '[He] 2s2 2p4', color: '#FF0D0D', description: 'Essential for respiration.' },
    { atomicNumber: 9, symbol: 'F', name: 'Fluorine', group: 17, period: 2, category: 'halogen', mass: 18.998, electronConfiguration: '[He] 2s2 2p5', color: '#90E050', description: 'Highly reactive.' },
    { atomicNumber: 10, symbol: 'Ne', name: 'Neon', group: 18, period: 2, category: 'noble-gas', mass: 20.180, electronConfiguration: '[He] 2s2 2p6', color: '#B3E3F5', description: 'Noble gas.' },

    { atomicNumber: 11, symbol: 'Na', name: 'Sodium', group: 1, period: 3, category: 'alkali', mass: 22.990, electronConfiguration: '[Ne] 3s1', color: '#AB5CF2', description: 'Reactive alkali metal.' },
    { atomicNumber: 12, symbol: 'Mg', name: 'Magnesium', group: 2, period: 3, category: 'alkaline-earth', mass: 24.305, electronConfiguration: '[Ne] 3s2', color: '#8AFF00', description: 'Alkaline earth metal.' },
    { atomicNumber: 13, symbol: 'Al', name: 'Aluminium', group: 13, period: 3, category: 'post-transition', mass: 26.982, electronConfiguration: '[Ne] 3s2 3p1', color: '#BFA6A6', description: 'lightweight metal.' },
    { atomicNumber: 14, symbol: 'Si', name: 'Silicon', group: 14, period: 3, category: 'metalloid', mass: 28.085, electronConfiguration: '[Ne] 3s2 3p2', color: '#F0C8A0', description: 'Semiconductor.' },
    { atomicNumber: 15, symbol: 'P', name: 'Phosphorus', group: 15, period: 3, category: 'nonmetal', mass: 30.974, electronConfiguration: '[Ne] 3s2 3p3', color: '#FF8000', description: 'Essential nonmetal.' },
    { atomicNumber: 16, symbol: 'S', name: 'Sulfur', group: 16, period: 3, category: 'nonmetal', mass: 32.06, electronConfiguration: '[Ne] 3s2 3p4', color: '#FFFF30', description: 'Essential nonmetal.' },
    { atomicNumber: 17, symbol: 'Cl', name: 'Chlorine', group: 17, period: 3, category: 'halogen', mass: 35.45, electronConfiguration: '[Ne] 3s2 3p5', color: '#1FF01F', description: 'Halogen.' },
    { atomicNumber: 18, symbol: 'Ar', name: 'Argon', group: 18, period: 3, category: 'noble-gas', mass: 39.948, electronConfiguration: '[Ne] 3s2 3p6', color: '#80D1E3', description: 'Noble gas.' },

    // Period 4
    { atomicNumber: 19, symbol: 'K', name: 'Potassium', group: 1, period: 4, category: 'alkali', mass: 39.098, electronConfiguration: '[Ar] 4s1', color: '#8F40D4', description: ' Alkali metal.' },
    { atomicNumber: 20, symbol: 'Ca', name: 'Calcium', group: 2, period: 4, category: 'alkaline-earth', mass: 40.078, electronConfiguration: '[Ar] 4s2', color: '#3DFF00', description: 'Alkaline earth metal.' },
    { atomicNumber: 21, symbol: 'Sc', name: 'Scandium', group: 3, period: 4, category: 'transition', mass: 44.956, electronConfiguration: '[Ar] 3d1 4s2', color: '#E6E6E6', description: 'Transition metal.' },
    { atomicNumber: 22, symbol: 'Ti', name: 'Titanium', group: 4, period: 4, category: 'transition', mass: 47.867, electronConfiguration: '[Ar] 3d2 4s2', color: '#BFC2C7', description: 'Strong metal.' },
    { atomicNumber: 23, symbol: 'V', name: 'Vanadium', group: 5, period: 4, category: 'transition', mass: 50.942, electronConfiguration: '[Ar] 3d3 4s2', color: '#A6A6AB', description: 'Transition metal.' },
    { atomicNumber: 24, symbol: 'Cr', name: 'Chromium', group: 6, period: 4, category: 'transition', mass: 51.996, electronConfiguration: '[Ar] 3d5 4s1', color: '#8A99C7', description: 'Hard metal.' },
    { atomicNumber: 25, symbol: 'Mn', name: 'Manganese', group: 7, period: 4, category: 'transition', mass: 54.938, electronConfiguration: '[Ar] 3d5 4s2', color: '#9C7AC7', description: 'Metal.' },
    { atomicNumber: 26, symbol: 'Fe', name: 'Iron', group: 8, period: 4, category: 'transition', mass: 55.845, electronConfiguration: '[Ar] 3d6 4s2', color: '#E06633', description: 'Ferrous metal.' },
    { atomicNumber: 27, symbol: 'Co', name: 'Cobalt', group: 9, period: 4, category: 'transition', mass: 58.933, electronConfiguration: '[Ar] 3d7 4s2', color: '#F090A0', description: 'Magnetic metal.' },
    { atomicNumber: 28, symbol: 'Ni', name: 'Nickel', group: 10, period: 4, category: 'transition', mass: 58.693, electronConfiguration: '[Ar] 3d8 4s2', color: '#5050C0', description: 'Corrosion resistant.' },
    { atomicNumber: 29, symbol: 'Cu', name: 'Copper', group: 11, period: 4, category: 'transition', mass: 63.546, electronConfiguration: '[Ar] 3d10 4s1', color: '#C88033', description: 'Conductor.' },
    { atomicNumber: 30, symbol: 'Zn', name: 'Zinc', group: 12, period: 4, category: 'transition', mass: 65.38, electronConfiguration: '[Ar] 3d10 4s2', color: '#7D80B0', description: 'Metal.' },
    { atomicNumber: 31, symbol: 'Ga', name: 'Gallium', group: 13, period: 4, category: 'post-transition', mass: 69.723, electronConfiguration: '[Ar] 3d10 4s2 4p1', color: '#C28F8F', description: 'Metal.' },
    { atomicNumber: 32, symbol: 'Ge', name: 'Germanium', group: 14, period: 4, category: 'metalloid', mass: 72.63, electronConfiguration: '[Ar] 3d10 4s2 4p2', color: '#668F8F', description: 'Metalloid.' },
    { atomicNumber: 33, symbol: 'As', name: 'Arsenic', group: 15, period: 4, category: 'metalloid', mass: 74.922, electronConfiguration: '[Ar] 3d10 4s2 4p3', color: '#BD80E3', description: 'Metalloid.' },
    { atomicNumber: 34, symbol: 'Se', name: 'Selenium', group: 16, period: 4, category: 'nonmetal', mass: 78.96, electronConfiguration: '[Ar] 3d10 4s2 4p4', color: '#FFA100', description: 'Nonmetal.' },
    { atomicNumber: 35, symbol: 'Br', name: 'Bromine', group: 17, period: 4, category: 'halogen', mass: 79.904, electronConfiguration: '[Ar] 3d10 4s2 4p5', color: '#A62929', description: 'Liquid halogen.' },
    { atomicNumber: 36, symbol: 'Kr', name: 'Krypton', group: 18, period: 4, category: 'noble-gas', mass: 83.798, electronConfiguration: '[Ar] 3d10 4s2 4p6', color: '#5CB8D1', description: 'Noble gas.' },

    // Period 5
    { atomicNumber: 37, symbol: 'Rb', name: 'Rubidium', group: 1, period: 5, category: 'alkali', mass: 85.468, electronConfiguration: '[Kr] 5s1', color: '#702EB0', description: 'Alkali metal.' },
    { atomicNumber: 38, symbol: 'Sr', name: 'Strontium', group: 2, period: 5, category: 'alkaline-earth', mass: 87.62, electronConfiguration: '[Kr] 5s2', color: '#00FF00', description: 'Alkaline earth metal.' },
    { atomicNumber: 39, symbol: 'Y', name: 'Yttrium', group: 3, period: 5, category: 'transition', mass: 88.906, electronConfiguration: '[Kr] 4d1 5s2', color: '#94FFFF', description: 'Transition metal.' },
    { atomicNumber: 40, symbol: 'Zr', name: 'Zirconium', group: 4, period: 5, category: 'transition', mass: 91.224, electronConfiguration: '[Kr] 4d2 5s2', color: '#94E0E0', description: 'Transition metal.' },
    { atomicNumber: 41, symbol: 'Nb', name: 'Niobium', group: 5, period: 5, category: 'transition', mass: 92.906, electronConfiguration: '[Kr] 4d4 5s1', color: '#73C2C9', description: 'Transition metal.' },
    { atomicNumber: 42, symbol: 'Mo', name: 'Molybdenum', group: 6, period: 5, category: 'transition', mass: 95.95, electronConfiguration: '[Kr] 4d5 5s1', color: '#54B5B5', description: 'Transition metal.' },
    { atomicNumber: 43, symbol: 'Tc', name: 'Technetium', group: 7, period: 5, category: 'transition', mass: 98, electronConfiguration: '[Kr] 4d5 5s2', color: '#3B9E9E', description: 'Radioactive.' },
    { atomicNumber: 44, symbol: 'Ru', name: 'Ruthenium', group: 8, period: 5, category: 'transition', mass: 101.07, electronConfiguration: '[Kr] 4d7 5s1', color: '#248F8F', description: 'Transition metal.' },
    { atomicNumber: 45, symbol: 'Rh', name: 'Rhodium', group: 9, period: 5, category: 'transition', mass: 102.91, electronConfiguration: '[Kr] 4d8 5s1', color: '#0A7D8C', description: 'Precious metal.' },
    { atomicNumber: 46, symbol: 'Pd', name: 'Palladium', group: 10, period: 5, category: 'transition', mass: 106.42, electronConfiguration: '[Kr] 4d10', color: '#006985', description: 'Precious metal.' },
    { atomicNumber: 47, symbol: 'Ag', name: 'Silver', group: 11, period: 5, category: 'transition', mass: 107.87, electronConfiguration: '[Kr] 4d10 5s1', color: '#C0C0C0', description: 'Precious metal.' },
    { atomicNumber: 48, symbol: 'Cd', name: 'Cadmium', group: 12, period: 5, category: 'transition', mass: 112.41, electronConfiguration: '[Kr] 4d10 5s2', color: '#FFD98F', description: 'Toxic metal.' },
    { atomicNumber: 49, symbol: 'In', name: 'Indium', group: 13, period: 5, category: 'post-transition', mass: 114.82, electronConfiguration: '[Kr] 4d10 5s2 5p1', color: '#A67573', description: 'Soft metal.' },
    { atomicNumber: 50, symbol: 'Sn', name: 'Tin', group: 14, period: 5, category: 'post-transition', mass: 118.71, electronConfiguration: '[Kr] 4d10 5s2 5p2', color: '#668080', description: 'Post-transition metal.' },
    { atomicNumber: 51, symbol: 'Sb', name: 'Antimony', group: 15, period: 5, category: 'metalloid', mass: 121.76, electronConfiguration: '[Kr] 4d10 5s2 5p3', color: '#9E63B5', description: 'Metalloid.' },
    { atomicNumber: 52, symbol: 'Te', name: 'Tellurium', group: 16, period: 5, category: 'metalloid', mass: 127.60, electronConfiguration: '[Kr] 4d10 5s2 5p4', color: '#D47A00', description: 'Metalloid.' },
    { atomicNumber: 53, symbol: 'I', name: 'Iodine', group: 17, period: 5, category: 'halogen', mass: 126.90, electronConfiguration: '[Kr] 4d10 5s2 5p5', color: '#940094', description: 'Halogen.' },
    { atomicNumber: 54, symbol: 'Xe', name: 'Xenon', group: 18, period: 5, category: 'noble-gas', mass: 131.29, electronConfiguration: '[Kr] 4d10 5s2 5p6', color: '#429EB0', description: 'Noble gas.' },

    // Period 6
    { atomicNumber: 55, symbol: 'Cs', name: 'Cesium', group: 1, period: 6, category: 'alkali', mass: 132.91, electronConfiguration: '[Xe] 6s1', color: '#57178F', description: 'Alkali metal.' },
    { atomicNumber: 56, symbol: 'Ba', name: 'Barium', group: 2, period: 6, category: 'alkaline-earth', mass: 137.33, electronConfiguration: '[Xe] 6s2', color: '#00C900', description: 'Alkaline earth metal.' },
    // Lanthanides
    { atomicNumber: 57, symbol: 'La', name: 'Lanthanum', group: 3, period: 6, category: 'lanthanide', mass: 138.91, electronConfiguration: '...', color: '#70D4FF', description: 'Lanthanide.' },
    { atomicNumber: 58, symbol: 'Ce', name: 'Cerium', group: 3, period: 6, category: 'lanthanide', mass: 140.12, electronConfiguration: '...', color: '#FFFFC7', description: 'Lanthanide.' },
    { atomicNumber: 59, symbol: 'Pr', name: 'Praseodymium', group: 3, period: 6, category: 'lanthanide', mass: 140.91, electronConfiguration: '...', color: '#D9FFC7', description: 'Lanthanide.' },
    { atomicNumber: 60, symbol: 'Nd', name: 'Neodymium', group: 3, period: 6, category: 'lanthanide', mass: 144.24, electronConfiguration: '...', color: '#C7FFC7', description: 'Lanthanide.' },
    { atomicNumber: 61, symbol: 'Pm', name: 'Promethium', group: 3, period: 6, category: 'lanthanide', mass: 145, electronConfiguration: '...', color: '#A3FFC7', description: 'Lanthanide.' },
    { atomicNumber: 62, symbol: 'Sm', name: 'Samarium', group: 3, period: 6, category: 'lanthanide', mass: 150.36, electronConfiguration: '...', color: '#8FFFC7', description: 'Lanthanide.' },
    { atomicNumber: 63, symbol: 'Eu', name: 'Europium', group: 3, period: 6, category: 'lanthanide', mass: 151.96, electronConfiguration: '...', color: '#61FFC7', description: 'Lanthanide.' },
    { atomicNumber: 64, symbol: 'Gd', name: 'Gadolinium', group: 3, period: 6, category: 'lanthanide', mass: 157.25, electronConfiguration: '...', color: '#45FFC7', description: 'Lanthanide.' },
    { atomicNumber: 65, symbol: 'Tb', name: 'Terbium', group: 3, period: 6, category: 'lanthanide', mass: 158.93, electronConfiguration: '...', color: '#30FFC7', description: 'Lanthanide.' },
    { atomicNumber: 66, symbol: 'Dy', name: 'Dysprosium', group: 3, period: 6, category: 'lanthanide', mass: 162.50, electronConfiguration: '...', color: '#1FFFC7', description: 'Lanthanide.' },
    { atomicNumber: 67, symbol: 'Ho', name: 'Holmium', group: 3, period: 6, category: 'lanthanide', mass: 164.93, electronConfiguration: '...', color: '#00FF9C', description: 'Lanthanide.' },
    { atomicNumber: 68, symbol: 'Er', name: 'Erbium', group: 3, period: 6, category: 'lanthanide', mass: 167.26, electronConfiguration: '...', color: '#00E675', description: 'Lanthanide.' },
    { atomicNumber: 69, symbol: 'Tm', name: 'Thulium', group: 3, period: 6, category: 'lanthanide', mass: 168.93, electronConfiguration: '...', color: '#00D452', description: 'Lanthanide.' },
    { atomicNumber: 70, symbol: 'Yb', name: 'Ytterbium', group: 3, period: 6, category: 'lanthanide', mass: 173.04, electronConfiguration: '...', color: '#00BF38', description: 'Lanthanide.' },
    { atomicNumber: 71, symbol: 'Lu', name: 'Lutetium', group: 3, period: 6, category: 'lanthanide', mass: 174.97, electronConfiguration: '...', color: '#00AB24', description: 'Lanthanide.' },
    // Back to Transition
    { atomicNumber: 72, symbol: 'Hf', name: 'Hafnium', group: 4, period: 6, category: 'transition', mass: 178.49, electronConfiguration: '[Xe] 4f14 5d2 6s2', color: '#4DC2FF', description: 'Transition metal.' },
    { atomicNumber: 73, symbol: 'Ta', name: 'Tantalum', group: 5, period: 6, category: 'transition', mass: 180.95, electronConfiguration: '[Xe] 4f14 5d3 6s2', color: '#4DA6FF', description: 'Transition metal.' },
    { atomicNumber: 74, symbol: 'W', name: 'Tungsten', group: 6, period: 6, category: 'transition', mass: 183.84, electronConfiguration: '[Xe] 4f14 5d4 6s2', color: '#2194D6', description: 'Transition metal.' },
    { atomicNumber: 75, symbol: 'Re', name: 'Rhenium', group: 7, period: 6, category: 'transition', mass: 186.21, electronConfiguration: '[Xe] 4f14 5d5 6s2', color: '#267DAB', description: 'Transition metal.' },
    { atomicNumber: 76, symbol: 'Os', name: 'Osmium', group: 8, period: 6, category: 'transition', mass: 190.23, electronConfiguration: '[Xe] 4f14 5d6 6s2', color: '#266696', description: 'Densest natural element.' },
    { atomicNumber: 77, symbol: 'Ir', name: 'Iridium', group: 9, period: 6, category: 'transition', mass: 192.22, electronConfiguration: '[Xe] 4f14 5d7 6s2', color: '#175487', description: 'Corrosion resistant.' },
    { atomicNumber: 78, symbol: 'Pt', name: 'Platinum', group: 10, period: 6, category: 'transition', mass: 195.08, electronConfiguration: '[Xe] 4f14 5d9 6s1', color: '#D0D0E0', description: 'Precious metal.' },
    { atomicNumber: 79, symbol: 'Au', name: 'Gold', group: 11, period: 6, category: 'transition', mass: 196.97, electronConfiguration: '[Xe] 4f14 5d10 6s1', color: '#FFD123', description: 'Precious metal.' },
    { atomicNumber: 80, symbol: 'Hg', name: 'Mercury', group: 12, period: 6, category: 'transition', mass: 200.59, electronConfiguration: '[Xe] 4f14 5d10 6s2', color: '#B8B8D0', description: 'Liquid metal.' },
    { atomicNumber: 81, symbol: 'Tl', name: 'Thallium', group: 13, period: 6, category: 'post-transition', mass: 204.38, electronConfiguration: '[Xe] 4f14 5d10 6s2 6p1', color: '#A6544D', description: 'Toxic metal.' },
    { atomicNumber: 82, symbol: 'Pb', name: 'Lead', group: 14, period: 6, category: 'post-transition', mass: 207.2, electronConfiguration: '[Xe] 4f14 5d10 6s2 6p2', color: '#575961', description: 'Heavy metal.' },
    { atomicNumber: 83, symbol: 'Bi', name: 'Bismuth', group: 15, period: 6, category: 'post-transition', mass: 208.98, electronConfiguration: '[Xe] 4f14 5d10 6s2 6p3', color: '#9E4FB5', description: 'Post-transition metal.' },
    { atomicNumber: 84, symbol: 'Po', name: 'Polonium', group: 16, period: 6, category: 'metalloid', mass: 209, electronConfiguration: '[Xe] 4f14 5d10 6s2 6p4', color: '#AB5C00', description: 'Radioactive.' },
    { atomicNumber: 85, symbol: 'At', name: 'Astatine', group: 17, period: 6, category: 'halogen', mass: 210, electronConfiguration: '[Xe] 4f14 5d10 6s2 6p5', color: '#754F45', description: 'Radioactive halogen.' },
    { atomicNumber: 86, symbol: 'Rn', name: 'Radon', group: 18, period: 6, category: 'noble-gas', mass: 222, electronConfiguration: '[Xe] 4f14 5d10 6s2 6p6', color: '#428296', description: 'Radioactive gas.' },

    // Period 7
    { atomicNumber: 87, symbol: 'Fr', name: 'Francium', group: 1, period: 7, category: 'alkali', mass: 223, electronConfiguration: '[Rn] 7s1', color: '#420066', description: 'Radioactive alkali metal.' },
    { atomicNumber: 88, symbol: 'Ra', name: 'Radium', group: 2, period: 7, category: 'alkaline-earth', mass: 226, electronConfiguration: '[Rn] 7s2', color: '#007D00', description: 'Radioactive alkaline earth.' },
    // Actinides
    { atomicNumber: 89, symbol: 'Ac', name: 'Actinium', group: 3, period: 7, category: 'actinide', mass: 227, electronConfiguration: '...', color: '#70ABFA', description: 'Actinide.' },
    { atomicNumber: 90, symbol: 'Th', name: 'Thorium', group: 3, period: 7, category: 'actinide', mass: 232.04, electronConfiguration: '...', color: '#00BAFF', description: 'Actinide.' },
    { atomicNumber: 91, symbol: 'Pa', name: 'Protactinium', group: 3, period: 7, category: 'actinide', mass: 231.04, electronConfiguration: '...', color: '#00A1FF', description: 'Actinide.' },
    { atomicNumber: 92, symbol: 'U', name: 'Uranium', group: 3, period: 7, category: 'actinide', mass: 238.03, electronConfiguration: '...', color: '#008FFF', description: 'Nuclear fuel.' },
    { atomicNumber: 93, symbol: 'Np', name: 'Neptunium', group: 3, period: 7, category: 'actinide', mass: 237, electronConfiguration: '...', color: '#0080FF', description: 'Actinide.' },
    { atomicNumber: 94, symbol: 'Pu', name: 'Plutonium', group: 3, period: 7, category: 'actinide', mass: 244, electronConfiguration: '...', color: '#006BFF', description: 'Synthethic element.' },
    { atomicNumber: 95, symbol: 'Am', name: 'Americium', group: 3, period: 7, category: 'actinide', mass: 243, electronConfiguration: '...', color: '#545CF2', description: 'Actinide.' },
    { atomicNumber: 96, symbol: 'Cm', name: 'Curium', group: 3, period: 7, category: 'actinide', mass: 247, electronConfiguration: '...', color: '#785CE3', description: 'Actinide.' },
    { atomicNumber: 97, symbol: 'Bk', name: 'Berkelium', group: 3, period: 7, category: 'actinide', mass: 247, electronConfiguration: '...', color: '#8A4FE3', description: 'Actinide.' },
    { atomicNumber: 98, symbol: 'Cf', name: 'Californium', group: 3, period: 7, category: 'actinide', mass: 251, electronConfiguration: '...', color: '#A136D4', description: 'Actinide.' },
    { atomicNumber: 99, symbol: 'Es', name: 'Einsteinium', group: 3, period: 7, category: 'actinide', mass: 252, electronConfiguration: '...', color: '#B31FD4', description: 'Actinide.' },
    { atomicNumber: 100, symbol: 'Fm', name: 'Fermium', group: 3, period: 7, category: 'actinide', mass: 257, electronConfiguration: '...', color: '#B31FBA', description: 'Actinide.' },
    { atomicNumber: 101, symbol: 'Md', name: 'Mendelevium', group: 3, period: 7, category: 'actinide', mass: 258, electronConfiguration: '...', color: '#B30DA6', description: 'Actinide.' },
    { atomicNumber: 102, symbol: 'No', name: 'Nobelium', group: 3, period: 7, category: 'actinide', mass: 259, electronConfiguration: '...', color: '#BD0D87', description: 'Actinide.' },
    { atomicNumber: 103, symbol: 'Lr', name: 'Lawrencium', group: 3, period: 7, category: 'actinide', mass: 262, electronConfiguration: '...', color: '#C70066', description: 'Actinide.' },
    // Transactinides
    { atomicNumber: 104, symbol: 'Rf', name: 'Rutherfordium', group: 4, period: 7, category: 'transition', mass: 267, electronConfiguration: '...', color: '#CC0059', description: 'Synthetic.' },
    { atomicNumber: 105, symbol: 'Db', name: 'Dubnium', group: 5, period: 7, category: 'transition', mass: 268, electronConfiguration: '...', color: '#D1004F', description: 'Synthetic.' },
    { atomicNumber: 106, symbol: 'Sg', name: 'Seaborgium', group: 6, period: 7, category: 'transition', mass: 271, electronConfiguration: '...', color: '#D90045', description: 'Synthetic.' },
    { atomicNumber: 107, symbol: 'Bh', name: 'Bohrium', group: 7, period: 7, category: 'transition', mass: 270, electronConfiguration: '...', color: '#E00038', description: 'Synthetic.' },
    { atomicNumber: 108, symbol: 'Hs', name: 'Hassium', group: 8, period: 7, category: 'transition', mass: 277, electronConfiguration: '...', color: '#E6002E', description: 'Synthetic.' },
    { atomicNumber: 109, symbol: 'Mt', name: 'Meitnerium', group: 9, period: 7, category: 'unknown', mass: 278, electronConfiguration: '...', color: '#EB0026', description: 'Synthetic.' },
    { atomicNumber: 110, symbol: 'Ds', name: 'Darmstadtium', group: 10, period: 7, category: 'unknown', mass: 281, electronConfiguration: '...', color: '#EB0026', description: 'Synthetic.' },
    { atomicNumber: 111, symbol: 'Rg', name: 'Roentgenium', group: 11, period: 7, category: 'unknown', mass: 282, electronConfiguration: '...', color: '#EB0026', description: 'Synthetic.' },
    { atomicNumber: 112, symbol: 'Cn', name: 'Copernicium', group: 12, period: 7, category: 'transition', mass: 285, electronConfiguration: '...', color: '#E61E2E', description: 'Synthetic.' },
    { atomicNumber: 113, symbol: 'Nh', name: 'Nihonium', group: 13, period: 7, category: 'unknown', mass: 286, electronConfiguration: '...', color: '#EB1E2E', description: 'Synthetic.' },
    { atomicNumber: 114, symbol: 'Fl', name: 'Flerovium', group: 14, period: 7, category: 'post-transition', mass: 289, electronConfiguration: '...', color: '#EB3B2E', description: 'Synthetic.' },
    { atomicNumber: 115, symbol: 'Mc', name: 'Moscovium', group: 15, period: 7, category: 'unknown', mass: 290, electronConfiguration: '...', color: '#EB592E', description: 'Synthetic.' },
    { atomicNumber: 116, symbol: 'Lv', name: 'Livermorium', group: 16, period: 7, category: 'unknown', mass: 293, electronConfiguration: '...', color: '#EB752E', description: 'Synthetic.' },
    { atomicNumber: 117, symbol: 'Ts', name: 'Tennessine', group: 17, period: 7, category: 'unknown', mass: 294, electronConfiguration: '...', color: '#EB942E', description: 'Synthetic.' },
    { atomicNumber: 118, symbol: 'Og', name: 'Oganesson', group: 18, period: 7, category: 'unknown', mass: 294, electronConfiguration: '...', color: '#EBB02E', description: 'Synthetic.' }
];

export { initialElements as elements };

export const getCategoryColor = (category: string) => {
    switch (category) {
        case 'alkali': return '#FF6666';
        case 'alkaline-earth': return '#FFDEAD';
        case 'transition': return '#FFC0C0';
        case 'post-transition': return '#CCCCCC';
        case 'metalloid': return '#CCCC99';
        case 'nonmetal': return '#A0FFA0';
        case 'halogen': return '#FFFF99';
        case 'noble-gas': return '#C0FFFF';
        case 'lanthanide': return '#FFBFFF';
        case 'actinide': return '#FF99CC';
        default: return '#EEEEEE';
    }
}

export const getElementBySymbol = (symbol: string) => initialElements.find(e => e.symbol === symbol);
