import { NextApiRequest, NextApiResponse } from 'next';

type MatchData = {
  matchPercent: number;
  matchQuote: string;
};

// Sample quotes for different compatibility ranges
const matchQuotes = {
  high: [
    "Your energies create a powerful resonance that amplifies both of your strengths.",
    "The crystal alignment between you two creates a harmonious flow of positive energy.",
    "Your combined energy signature reveals a deep spiritual connection that transcends time.",
  ],
  medium: [
    "Your energies complement each other in interesting ways, creating balance through differences.",
    "While your energy patterns differ, they create an intriguing dance of complementary forces.",
    "Your crystal resonance shows potential for growth through mutual understanding.",
  ],
  low: [
    "Your energy signatures operate on different frequencies, offering opportunities for growth.",
    "Your crystal alignments suggest a relationship that requires conscious effort to harmonize.",
    "Your energetic differences can become strengths if approached with awareness and patience.",
  ]
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<MatchData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mine, friend } = req.query;

  if (!mine || !friend || typeof mine !== 'string' || typeof friend !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid birth dates' });
  }

  try {
    // Parse dates
    const myDate = new Date(mine);
    const friendDate = new Date(friend);
    
    // Simple algorithm: calculate difference between months and use that for compatibility
    const myMonth = myDate.getMonth();
    const friendMonth = friendDate.getMonth();
    
    // Calculate absolute difference between months (0-6)
    const monthDiff = Math.abs(myMonth - friendMonth);
    
    // Convert to percentage (higher is better)
    // Formula: 100 - (difference * 8) gives us a range from 52-100%
    let matchPercent = 100 - (monthDiff * 8);
    
    // Ensure minimum 50% match for better user experience
    matchPercent = Math.max(50, matchPercent);
    
    // Round to nearest whole number
    matchPercent = Math.round(matchPercent);
    
    // Select appropriate quote based on match percentage
    let quoteCategory = 'medium';
    if (matchPercent >= 85) {
      quoteCategory = 'high';
    } else if (matchPercent < 65) {
      quoteCategory = 'low';
    }
    
    // Get random quote from appropriate category
    const quotes = matchQuotes[quoteCategory as keyof typeof matchQuotes];
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const matchQuote = quotes[randomIndex];
    
    // Return match data
    return res.status(200).json({
      matchPercent,
      matchQuote
    });
  } catch (error) {
    console.error('Error calculating match:', error);
    return res.status(500).json({ error: 'Failed to calculate energy match' });
  }
} 