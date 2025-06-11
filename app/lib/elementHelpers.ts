import { type ElementType } from './energyCalculationConfig';

// Crystal information for each element
export const getCrystalForElement = (element: ElementType) => {
  const crystals = {
    'water': { name: 'Moonstone', bgColor: 'bg-blue-900/30', color: 'text-blue-300' },
    'fire': { name: 'Carnelian', bgColor: 'bg-red-900/30', color: 'text-red-300' },
    'earth': { name: 'Citrine', bgColor: 'bg-yellow-900/30', color: 'text-yellow-300' },
    'metal': { name: 'Clear Quartz', bgColor: 'bg-gray-900/30', color: 'text-gray-300' },
    'wood': { name: 'Green Aventurine', bgColor: 'bg-green-900/30', color: 'text-green-300' }
  };
  return crystals[element] || crystals.water;
};

// Element icons
export const getElementIcon = (element: ElementType) => {
  const icons = {
    'water': '💧',
    'fire': '🔥',
    'earth': '🌱',
    'metal': '⚡',
    'wood': '🌿'
  };
  return icons[element] || '💎';
};

// Element descriptions
export const getElementDescription = (element: ElementType) => {
  const descriptions = {
    'water': 'Flow & Intuition',
    'fire': 'Passion & Energy',
    'earth': 'Grounding & Stability',
    'metal': 'Clarity & Structure',
    'wood': 'Growth & Creativity'
  };
  return descriptions[element] || 'Balance';
};

// Element color classes for UI
export const getElementColorClass = (element: ElementType): {bg: string, text: string} => {
  const colors = {
    'water': { bg: 'bg-blue-900/30', text: 'text-blue-300' },
    'fire': { bg: 'bg-red-900/30', text: 'text-red-300' },
    'earth': { bg: 'bg-yellow-900/30', text: 'text-yellow-300' },
    'metal': { bg: 'bg-gray-900/30', text: 'text-gray-300' },
    'wood': { bg: 'bg-green-900/30', text: 'text-green-300' }
  };
  return colors[element] || colors.water;
}; 