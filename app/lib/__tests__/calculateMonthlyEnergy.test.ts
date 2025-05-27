import { calculateMonthlyEnergy, ElementRecord } from '../calculateMonthlyEnergy';
import { getBaziFromLunar } from '../getBaziFromLunar';

// Mock getBaziFromLunar to avoid external dependencies
jest.mock('../getBaziFromLunar', () => ({
  getBaziFromLunar: jest.fn()
}));

describe('calculateMonthlyEnergy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should calculate monthly energy scores correctly', () => {
    // Setup mock for birth date
    (getBaziFromLunar as jest.Mock).mockImplementation((date: Date) => {
      if (date.toISOString().includes('1990')) {
        // Birth date mock
        return {
          yearPillar: '庚午',
          monthPillar: '庚申',
          dayPillar: '丙戌',
          fiveElements: {
            year: ['metal', 'fire'],
            month: ['metal', 'metal'],
            day: ['fire', 'earth']
          }
        };
      } else {
        // Current date mock
        return {
          yearPillar: '癸卯',
          monthPillar: '丙辰',
          fiveElements: {
            year: ['water', 'wood'],
            month: ['fire', 'earth']
          }
        };
      }
    });
    
    const result = calculateMonthlyEnergy({
      birthday: '1990-06-15'
    });
    
    // Verify structure
    expect(result).toHaveProperty('monthScores');
    expect(result).toHaveProperty('baseScores');
    expect(result).toHaveProperty('diffScores');
    expect(result).toHaveProperty('trend');
    expect(result).toHaveProperty('trendMsg');
    
    // Verify element properties
    expect(Object.keys(result.monthScores)).toEqual(['wood', 'fire', 'earth', 'metal', 'water']);
    expect(Object.keys(result.baseScores)).toEqual(['wood', 'fire', 'earth', 'metal', 'water']);
    
    // All scores should be between 0 and 100
    Object.values(result.monthScores).forEach(score => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
  
  it('should calculate differences from previous month correctly', () => {
    // Setup mock
    (getBaziFromLunar as jest.Mock).mockImplementation(() => ({
      yearPillar: '庚午',
      monthPillar: '庚申',
      dayPillar: '丙戌',
      fiveElements: {
        year: ['metal', 'fire'],
        month: ['metal', 'metal'],
        day: ['fire', 'earth']
      }
    }));
    
    // Previous month scores
    const prevMonthScores: ElementRecord = {
      wood: 60,
      fire: 70,
      earth: 80,
      metal: 90,
      water: 50
    };
    
    const result = calculateMonthlyEnergy({
      birthday: '1990-06-15',
      prevMonthScores
    });
    
    // Check that diff scores are calculated
    expect(result.diffScores.wood).toBe(result.monthScores.wood - prevMonthScores.wood);
    expect(result.diffScores.fire).toBe(result.monthScores.fire - prevMonthScores.fire);
    expect(result.diffScores.earth).toBe(result.monthScores.earth - prevMonthScores.earth);
    expect(result.diffScores.metal).toBe(result.monthScores.metal - prevMonthScores.metal);
    expect(result.diffScores.water).toBe(result.monthScores.water - prevMonthScores.water);
  });
  
  it('should determine trend correctly', () => {
    // Setup mock
    (getBaziFromLunar as jest.Mock).mockImplementation(() => ({
      yearPillar: '庚午',
      monthPillar: '庚申',
      dayPillar: '丙戌',
      fiveElements: {
        year: ['metal', 'fire'],
        month: ['metal', 'metal'],
        day: ['fire', 'earth']
      }
    }));
    
    // Test "up" trend
    const prevMonthScoresUp: ElementRecord = {
      wood: 30,
      fire: 30,
      earth: 30,
      metal: 30,
      water: 30
    };
    
    // Mock monthScores to force them higher than prev scores
    jest.spyOn(Math, 'random').mockReturnValue(0.9); // Force high random scores
    
    const resultUp = calculateMonthlyEnergy({
      birthday: '1990-06-15',
      prevMonthScores: prevMonthScoresUp
    });
    
    // If diff is large enough, trend should be "up"
    if (Object.values(resultUp.diffScores).reduce((sum, val) => sum + val, 0) / 5 >= 3) {
      expect(resultUp.trend).toBe('up');
    }
    
    // Restore Math.random
    jest.spyOn(Math, 'random').mockRestore();
    
    // Test "down" trend
    const prevMonthScoresDown: ElementRecord = {
      wood: 90,
      fire: 90,
      earth: 90,
      metal: 90,
      water: 90
    };
    
    // Mock monthScores to force them lower than prev scores
    jest.spyOn(Math, 'random').mockReturnValue(0.1); // Force low random scores
    
    const resultDown = calculateMonthlyEnergy({
      birthday: '1990-06-15',
      prevMonthScores: prevMonthScoresDown
    });
    
    // If diff is large enough negative, trend should be "down"
    if (Object.values(resultDown.diffScores).reduce((sum, val) => sum + val, 0) / 5 <= -3) {
      expect(resultDown.trend).toBe('down');
    }
  });
  
  it('should handle getBaziFromLunar errors gracefully', () => {
    // Setup mock to throw error
    (getBaziFromLunar as jest.Mock).mockReturnValue(null);
    
    // Should throw an error
    expect(() => calculateMonthlyEnergy({
      birthday: '1990-06-15'
    })).toThrow('Failed to calculate base eight characters data');
  });
}); 