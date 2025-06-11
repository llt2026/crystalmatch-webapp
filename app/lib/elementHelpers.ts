import { ElementType } from './energyCalculationConfig';

export const elementColors = {
  water: { bg: 'bg-blue-900/40', text: 'text-blue-300' },
  fire:  { bg: 'bg-red-900/40',  text: 'text-red-300' },
  earth: { bg: 'bg-yellow-900/40', text: 'text-yellow-300' },
  metal: { bg: 'bg-purple-900/40', text: 'text-purple-300' },
  wood:  { bg: 'bg-green-900/40', text: 'text-green-300' }
} as const;

export function getElementColorClass(el: ElementType) {
  return elementColors[el] ?? elementColors.water;
}

export function getElementIcon(el: ElementType) {
  return { water: '💧', fire: '🔥', earth: '🌍', metal: '⚡', wood: '🌿' }[el] ?? '💧';
}

export function getElementDescription(el: ElementType) {
  return {
    water: 'Fluid Energy',
    fire:  'Passion Energy',
    earth: 'Stable Energy',
    metal: 'Sharp Energy',
    wood:  'Growth Energy'
  }[el] ?? 'Fluid Energy';
}

export function getCrystalForElement(el: ElementType) {
  return {
    water: { name: 'Clear Quartz',   bgColor: 'bg-blue-900/50',  color: 'text-blue-300' },
    fire:  { name: 'Red Jasper',     bgColor: 'bg-red-900/50',   color: 'text-red-300' },
    earth: { name: 'Amethyst',       bgColor: 'bg-purple-900/50',color: 'text-purple-300' },
    metal: { name: 'Citrine',        bgColor: 'bg-yellow-900/50',color: 'text-yellow-300' },
    wood:  { name: 'Green Jade',     bgColor: 'bg-green-900/50', color: 'text-green-300' }
  }[el] ?? { name: 'Clear Quartz', bgColor: 'bg-blue-900/50', color: 'text-blue-300' };
}