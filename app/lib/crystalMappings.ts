// 常用水晶列表，根据月份和元素特性分配
export const CRYSTALS_BY_TREND: Record<string, string[]> = {
  'up': ['Clear Quartz', 'Citrine', 'Tiger\'s Eye', 'Pyrite', 'Carnelian'],
  'down': ['Amethyst', 'Rose Quartz', 'Blue Lace Agate', 'Smoky Quartz', 'Labradorite'],
  'stable': ['Green Aventurine', 'Amazonite', 'Malachite', 'Moss Agate', 'Jade']
};

// 五行属性对应的水晶
export const CRYSTAL_MAP: Record<string, string> = {
  'wood': 'Jade',
  'fire': 'Ruby',
  'earth': 'Citrine',
  'metal': 'Clear Quartz',
  'water': 'Sodalite'
}; 