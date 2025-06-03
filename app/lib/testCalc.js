/**
 * Simple Energy Calculation Test
 */

// Base BaZi vector (Wood:3, Fire:2, Earth:1, Metal:1, Water:1)
const baseVector = {
  wood: 3/8,
  fire: 2/8,
  earth: 1/8,
  metal: 1/8,
  water: 1/8
};

// Year 2025 (Yi-Si)
const yearVector = {
  wood: 0.5,
  fire: 0.38,
  earth: 0.03,
  metal: 0.09,
  water: 0
};

// Month June 2025 (Geng-Wu)
const monthVector = {
  wood: 0,
  fire: 0.38,
  earth: 0.12,
  metal: 0.5,
  water: 0
};

// Calculate monthly energy
function calculateEnergy() {
  // 1. Combine with weights: BaZi 60% + Year 15% + Month 25%
  const combined = {
    wood: baseVector.wood * 0.6 + yearVector.wood * 0.15 + monthVector.wood * 0.25,
    fire: baseVector.fire * 0.6 + yearVector.fire * 0.15 + monthVector.fire * 0.25,
    earth: baseVector.earth * 0.6 + yearVector.earth * 0.15 + monthVector.earth * 0.25,
    metal: baseVector.metal * 0.6 + yearVector.metal * 0.15 + monthVector.metal * 0.25,
    water: baseVector.water * 0.6 + yearVector.water * 0.15 + monthVector.water * 0.25
  };
  
  // 2. Calculate total for normalization
  const total = combined.wood + combined.fire + combined.earth + combined.metal + combined.water;
  
  // 3. Scale to sum of 8
  const scaled = {
    wood: (combined.wood / total) * 8,
    fire: (combined.fire / total) * 8,
    earth: (combined.earth / total) * 8,
    metal: (combined.metal / total) * 8,
    water: (combined.water / total) * 8
  };
  
  // 4. Calculate deviation from ideal (1.6)
  const ideal = 1.6; // 8 / 5
  const deviation = 
    Math.abs(scaled.wood - ideal) +
    Math.abs(scaled.fire - ideal) +
    Math.abs(scaled.earth - ideal) +
    Math.abs(scaled.metal - ideal) +
    Math.abs(scaled.water - ideal);
  
  // 5. Calculate score
  const score = 100 - (deviation / 12.8 * 100);
  
  // 6. Calculate base score
  const baseScaled = {
    wood: baseVector.wood * 8,
    fire: baseVector.fire * 8,
    earth: baseVector.earth * 8,
    metal: baseVector.metal * 8,
    water: baseVector.water * 8
  };
  
  const baseDeviation = 
    Math.abs(baseScaled.wood - ideal) +
    Math.abs(baseScaled.fire - ideal) +
    Math.abs(baseScaled.earth - ideal) +
    Math.abs(baseScaled.metal - ideal) +
    Math.abs(baseScaled.water - ideal);
  
  const baseScore = 100 - (baseDeviation / 12.8 * 100);
  
  // 7. Calculate energy change
  const energyChange = score - baseScore;
  
  // Return all calculation results
  return {
    combined,
    scaled,
    deviation,
    score,
    baseScaled,
    baseDeviation,
    baseScore,
    energyChange
  };
}

// Run calculation and print results
const results = calculateEnergy();

console.log("==== CALCULATION RESULTS ====");
console.log("Combined Vector:", results.combined);
console.log("Scaled Vector (sum=8):", results.scaled);
console.log("Deviation:", results.deviation);
console.log("Monthly Energy Score:", results.score);
console.log("Base Deviation:", results.baseDeviation);
console.log("Base Score:", results.baseScore);
console.log("Energy Change:", results.energyChange); 