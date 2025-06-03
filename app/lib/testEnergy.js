/**
 * 2025 Energy Calculation Test Script
 * Testing the energy calculation for June 2025 (Geng-Wu month)
 */

// Set up the base BaZi five elements vector for testing
const baseVector = {
  wood: 3/8,   // Wood = 3
  fire: 2/8,   // Fire = 2
  earth: 1/8,  // Earth = 1
  metal: 1/8,  // Metal = 1
  water: 1/8   // Water = 1
};

// 2025 is Yi-Si year
const yearPillar = ['乙', '巳'];
// June is Geng-Wu month
const monthPillar = ['庚', '午'];

// Calculate the flow year vector manually
function calculateYearVector() {
  // Yi = Wood
  const yearGanElements = { wood: 1.0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  // Si = Fire (main qi) + Hidden Stems (Bing Fire 0.6 + Geng Metal 0.3 + Wu Earth 0.1)
  const yearZhiMainElement = { wood: 0, fire: 1.0, earth: 0, metal: 0, water: 0 };
  const yearZhiHiddenElements = { wood: 0, fire: 0.6, earth: 0.1, metal: 0.3, water: 0 };
  
  // Combine the TianGan and DiZhi elements with weights
  const yearVector = {
    wood: yearGanElements.wood * 0.5 + yearZhiMainElement.wood * 0.2 + yearZhiHiddenElements.wood * 0.3,
    fire: yearGanElements.fire * 0.5 + yearZhiMainElement.fire * 0.2 + yearZhiHiddenElements.fire * 0.3,
    earth: yearGanElements.earth * 0.5 + yearZhiMainElement.earth * 0.2 + yearZhiHiddenElements.earth * 0.3,
    metal: yearGanElements.metal * 0.5 + yearZhiMainElement.metal * 0.2 + yearZhiHiddenElements.metal * 0.3,
    water: yearGanElements.water * 0.5 + yearZhiMainElement.water * 0.2 + yearZhiHiddenElements.water * 0.3
  };
  
  console.log('Flow Year (Yi-Si) Vector:', yearVector);
  
  // Normalize to sum of 1
  const total = yearVector.wood + yearVector.fire + yearVector.earth + yearVector.metal + yearVector.water;
  const normalizedVector = {
    wood: yearVector.wood / total,
    fire: yearVector.fire / total,
    earth: yearVector.earth / total,
    metal: yearVector.metal / total,
    water: yearVector.water / total
  };
  
  console.log('Flow Year Vector (Normalized):', normalizedVector);
  return normalizedVector;
}

// Calculate the flow month vector manually
function calculateMonthVector() {
  // Geng = Metal
  const monthGanElements = { wood: 0, fire: 0, earth: 0, metal: 1.0, water: 0 };
  
  // Wu = Fire (main qi) + Hidden Stems (Ding Fire 0.6 + Ji Earth 0.4)
  const monthZhiMainElement = { wood: 0, fire: 1.0, earth: 0, metal: 0, water: 0 };
  const monthZhiHiddenElements = { wood: 0, fire: 0.6, earth: 0.4, metal: 0, water: 0 };
  
  // Combine the TianGan and DiZhi elements with weights
  const monthVector = {
    wood: monthGanElements.wood * 0.5 + monthZhiMainElement.wood * 0.2 + monthZhiHiddenElements.wood * 0.3,
    fire: monthGanElements.fire * 0.5 + monthZhiMainElement.fire * 0.2 + monthZhiHiddenElements.fire * 0.3,
    earth: monthGanElements.earth * 0.5 + monthZhiMainElement.earth * 0.2 + monthZhiHiddenElements.earth * 0.3,
    metal: monthGanElements.metal * 0.5 + monthZhiMainElement.metal * 0.2 + monthZhiHiddenElements.metal * 0.3,
    water: monthGanElements.water * 0.5 + monthZhiMainElement.water * 0.2 + monthZhiHiddenElements.water * 0.3
  };
  
  console.log('Flow Month (Geng-Wu) Vector:', monthVector);
  
  // Normalize to sum of 1
  const total = monthVector.wood + monthVector.fire + monthVector.earth + monthVector.metal + monthVector.water;
  const normalizedVector = {
    wood: monthVector.wood / total,
    fire: monthVector.fire / total,
    earth: monthVector.earth / total,
    metal: monthVector.metal / total,
    water: monthVector.water / total
  };
  
  console.log('Flow Month Vector (Normalized):', normalizedVector);
  return normalizedVector;
}

// Calculate the monthly energy score
function calculateMonthEnergy() {
  console.log('\n===== STEP 1: BASE DATA =====');
  // Base BaZi
  console.log('Base BaZi Vector:', baseVector);
  
  // Flow year vector
  const yearVector = calculateYearVector();
  
  // Flow month vector
  const monthVector = calculateMonthVector();
  
  console.log('\n===== STEP 2: CALCULATE COMBINED WEIGHTS =====');
  // Weights: BaZi 60% + Flow Year 15% + Flow Month 25%
  const combined = {
    wood: baseVector.wood * 0.6 + yearVector.wood * 0.15 + monthVector.wood * 0.25,
    fire: baseVector.fire * 0.6 + yearVector.fire * 0.15 + monthVector.fire * 0.25,
    earth: baseVector.earth * 0.6 + yearVector.earth * 0.15 + monthVector.earth * 0.25,
    metal: baseVector.metal * 0.6 + yearVector.metal * 0.15 + monthVector.metal * 0.25,
    water: baseVector.water * 0.6 + yearVector.water * 0.15 + monthVector.water * 0.25
  };
  
  console.log('Combined Vector with Weights:', combined);
  
  console.log('\n===== STEP 3: SCALE TO SUM OF 8 =====');
  // Scale to sum of 8
  const total = combined.wood + combined.fire + combined.earth + combined.metal + combined.water;
  const scaledVector = {
    wood: (combined.wood / total) * 8,
    fire: (combined.fire / total) * 8,
    earth: (combined.earth / total) * 8,
    metal: (combined.metal / total) * 8,
    water: (combined.water / total) * 8
  };
  
  console.log('Scaled to Sum of 8:', scaledVector);
  console.log('Verify Sum:', scaledVector.wood + scaledVector.fire + scaledVector.earth + scaledVector.metal + scaledVector.water);
  
  console.log('\n===== STEP 4: CALCULATE DEVIATION =====');
  // Calculate deviation
  const ideal = 1.6; // Ideal value = 8 / 5
  const deviation = 
    Math.abs(scaledVector.wood - ideal) +
    Math.abs(scaledVector.fire - ideal) +
    Math.abs(scaledVector.earth - ideal) +
    Math.abs(scaledVector.metal - ideal) +
    Math.abs(scaledVector.water - ideal);
  
  console.log('Total Deviation:', deviation);
  
  console.log('\n===== STEP 5: CALCULATE SCORE =====');
  // Calculate score
  const score = 100 - (deviation / 12.8 * 100);
  console.log('Monthly Energy Score:', score);
  
  console.log('\n===== STEP 6: CALCULATE BASE SCORE =====');
  // Calculate base score
  const baseScaledVector = {
    wood: baseVector.wood * 8,
    fire: baseVector.fire * 8,
    earth: baseVector.earth * 8,
    metal: baseVector.metal * 8,
    water: baseVector.water * 8
  };
  
  console.log('Base BaZi Scaled to Sum of 8:', baseScaledVector);
  
  const baseDeviation = 
    Math.abs(baseScaledVector.wood - ideal) +
    Math.abs(baseScaledVector.fire - ideal) +
    Math.abs(baseScaledVector.earth - ideal) +
    Math.abs(baseScaledVector.metal - ideal) +
    Math.abs(baseScaledVector.water - ideal);
  
  console.log('Base Deviation:', baseDeviation);
  
  const baseScore = 100 - (baseDeviation / 12.8 * 100);
  console.log('Base BaZi Score:', baseScore);
  
  console.log('\n===== STEP 7: CALCULATE ENERGY CHANGE =====');
  // Calculate energy change
  const energyChange = score - baseScore;
  console.log('Energy Change Value:', energyChange);
  
  return { score, baseScore, energyChange };
}

// Run the test
console.log('===== TESTING ENERGY CALCULATION FOR JUNE 2025 (GENG-WU MONTH) =====');
calculateMonthEnergy(); 