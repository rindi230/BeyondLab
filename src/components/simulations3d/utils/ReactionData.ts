import { ElementData, getElementBySymbol } from './ElementData';

export interface ReactionResult {
    product: string;
    type: 'ionic' | 'covalent' | 'metallic' | 'combustion' | 'none';
    equation: string;
    description: string;
    color: string;
    particleCount?: number;
    energyRelease?: 'low' | 'medium' | 'high';
}

export const reactions: Record<string, ReactionResult> = {
    // Ordered alphabetically for the key: Element1-Element2
    'Cl-Na': {
        product: 'Sodium Chloride (Salt)',
        type: 'ionic',
        equation: '2Na + Cl₂ → 2NaCl',
        description: 'A vigorous reaction where sodium gives an electron to chlorine, forming an ionic crystal lattice.',
        color: '#FFFFFF',
        energyRelease: 'high'
    },
    'H-O': {
        product: 'Water',
        type: 'covalent',
        equation: '2H₂ + O₂ → 2H₂O',
        description: 'Explosive reaction forming water molecules. Hydrogen and Oxygen share electrons.',
        color: '#4444FF',
        energyRelease: 'high'
    },
    'C-O': {
        product: 'Carbon Dioxide',
        type: 'covalent',
        equation: 'C + O₂ → CO₂',
        description: 'Carbon burns in oxygen to form carbon dioxide gas.',
        color: '#555555',
        energyRelease: 'medium'
    },
    'Fe-O': {
        product: 'Iron Oxide (Rust)',
        type: 'ionic',
        equation: '4Fe + 3O₂ → 2Fe₂O₃',
        description: 'Slow oxidation of iron forming a reddish-brown oxide.',
        color: '#8B4513',
        energyRelease: 'low'
    },
    'Cl-H': {
        product: 'Hydrogen Chloride',
        type: 'covalent',
        equation: 'H₂ + Cl₂ → 2HCl',
        description: 'Formation of corrosive hydrogen chloride gas.',
        color: '#CCCC00',
        energyRelease: 'medium'
    },
    'Na-O': {
        product: 'Sodium Oxide',
        type: 'ionic',
        equation: '4Na + O₂ → 2Na₂O',
        description: 'Sodium reacts rapidly with oxygen.',
        color: '#E0E0E0',
        energyRelease: 'medium'
    }
};

const getProceduralReaction = (e1: ElementData, e2: ElementData): ReactionResult => {
    // 1. Noble Gases -> No Reaction
    if (e1.group === 18 || e2.group === 18) {
        return {
            product: 'No Reaction',
            type: 'none',
            equation: `${e1.symbol} + ${e2.symbol} → ${e1.symbol} + ${e2.symbol}`,
            description: `${e1.group === 18 ? e1.name : e2.name} is a Noble Gas and is chemically inert.`,
            color: '#FFFFFF',
            energyRelease: 'low'
        };
    }

    // 2. Metal + Non-Metal -> Ionic
    const isMetal = (e: ElementData) =>
        e.category === 'alkali' ||
        e.category === 'alkaline-earth' ||
        e.category === 'transition' ||
        e.category === 'post-transition' ||
        e.category === 'lanthanide' ||
        e.category === 'actinide';

    const isNonMetal = (e: ElementData) =>
        e.category === 'nonmetal' ||
        e.category === 'halogen';

    const e1Metal = isMetal(e1);
    const e2Metal = isMetal(e2);
    const e1NonMetal = isNonMetal(e1);
    const e2NonMetal = isNonMetal(e2);

    if ((e1Metal && e2NonMetal) || (e1NonMetal && e2Metal)) {
        return {
            product: `${e1Metal ? e1.name : e2.name} ${e1Metal ? e2.name : e1.name}-ide`, // Simplified naming
            type: 'ionic',
            equation: `${e1.symbol} + ${e2.symbol} → ${e1.symbol}${e2.symbol} (Ionic)`,
            description: `Hypothetical ionic bond between metal ${e1Metal ? e1.name : e2.name} and non-metal ${e1Metal ? e2.name : e1.name}.`,
            color: '#FFFFAA',
            energyRelease: 'medium'
        };
    }

    // 3. Non-Metal + Non-Metal -> Covalent
    if (e1NonMetal && e2NonMetal) {
        return {
            product: `Covalent Molecule`,
            type: 'covalent',
            equation: `${e1.symbol} + ${e2.symbol} → ${e1.symbol}${e2.symbol}`,
            description: 'Likely covalent bonding sharing electrons.',
            color: '#AAFFFF',
            energyRelease: 'medium'
        };
    }

    // 4. Metal + Metal -> Metallic / Alloy
    if (e1Metal && e2Metal) {
        return {
            product: `Alloy / Mixture`,
            type: 'metallic',
            equation: `${e1.symbol} + ${e2.symbol} → Mixture`,
            description: 'Metallic bonding or alloy formation.',
            color: '#CCCCCC',
            energyRelease: 'low'
        };
    }

    // Fallback
    return {
        product: 'Interaction',
        type: 'none',
        equation: '?',
        description: 'Unknown or complex interaction.',
        color: '#FFFFFF'
    };
};

export const getReaction = (e1: ElementData, e2: ElementData): ReactionResult => {
    const key = [e1.symbol, e2.symbol].sort().join('-');

    // Check specific database first
    if (reactions[key]) {
        return reactions[key];
    }

    // Fallback to procedural
    return getProceduralReaction(e1, e2);
};
