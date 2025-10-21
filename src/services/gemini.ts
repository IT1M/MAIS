import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;

// Rate limiting
const requestQueue: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 60;

// Cache for identical requests
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function initializeGemini(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

function checkRateLimit(): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  // Remove old requests
  while (requestQueue.length > 0 && requestQueue[0] < oneMinuteAgo) {
    requestQueue.shift();
  }
  
  if (requestQueue.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  requestQueue.push(now);
  return true;
}

function getCachedResponse(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedResponse(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function callGemini(prompt: string, cacheKey?: string): Promise<string> {
  try {
    // Check cache first
    if (cacheKey) {
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Check rate limit
    if (!checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const ai = initializeGemini();
    const model = ai.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Cache the response
    if (cacheKey) {
      setCachedResponse(cacheKey, text);
    }

    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate AI insights. Please try again later.');
  }
}

export async function analyzeInventory(data: {
  items: any[];
  totalQuantity: number;
  rejectRate: number;
  byDestination: Record<string, any>;
  byCategory: Record<string, any>;
}): Promise<{
  insights: string[];
  recommendations: string[];
  alerts: string[];
  confidenceScore: number;
}> {
  const cacheKey = `analyze-${JSON.stringify(data).substring(0, 100)}`;
  
  const prompt = `
Analyze this medical inventory data and provide actionable insights:

Total Items: ${data.items.length}
Total Quantity: ${data.totalQuantity}
Reject Rate: ${data.rejectRate.toFixed(2)}%

By Destination:
${JSON.stringify(data.byDestination, null, 2)}

By Category:
${JSON.stringify(data.byCategory, null, 2)}

Please provide:
1. Key insights about stock levels and trends
2. Specific recommendations for optimization
3. Any alerts or concerns that need immediate attention

Format your response as JSON with this structure:
{
  "insights": ["insight 1", "insight 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "alerts": ["alert 1", "alert 2", ...],
  "confidenceScore": 0.85
}
`;

  try {
    const response = await callGemini(prompt, cacheKey);
    const parsed = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    return parsed;
  } catch (error) {
    // Graceful fallback
    return {
      insights: ['Unable to generate AI insights at this time'],
      recommendations: ['Please review inventory manually'],
      alerts: [],
      confidenceScore: 0
    };
  }
}

export async function generateTrendPredictions(historicalData: {
  dates: string[];
  quantities: number[];
  rejects: number[];
}): Promise<{
  predictions: Array<{ date: string; predictedQuantity: number; confidence: number }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  summary: string;
}> {
  const cacheKey = `trends-${historicalData.dates[0]}-${historicalData.dates[historicalData.dates.length - 1]}`;
  
  const prompt = `
Analyze this historical medical inventory data and predict future trends:

Dates: ${historicalData.dates.join(', ')}
Quantities: ${historicalData.quantities.join(', ')}
Rejects: ${historicalData.rejects.join(', ')}

Provide:
1. Predictions for the next 7 days
2. Overall trend direction
3. Summary of findings

Format as JSON:
{
  "predictions": [
    {"date": "2025-10-21", "predictedQuantity": 1500, "confidence": 0.85},
    ...
  ],
  "trend": "increasing",
  "summary": "Brief summary of trend analysis"
}
`;

  try {
    const response = await callGemini(prompt, cacheKey);
    const parsed = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    return parsed;
  } catch (error) {
    return {
      predictions: [],
      trend: 'stable',
      summary: 'Unable to generate predictions at this time'
    };
  }
}

export async function generateMonthlyInsights(monthData: {
  month: string;
  totalItems: number;
  totalQuantity: number;
  rejectRate: number;
  topCategories: Array<{ category: string; count: number }>;
  comparisonToPrevious: { quantityChange: number; rejectChange: number };
}): Promise<string> {
  const cacheKey = `monthly-${monthData.month}`;
  
  const prompt = `
Generate a comprehensive monthly summary for this medical inventory data:

Month: ${monthData.month}
Total Items: ${monthData.totalItems}
Total Quantity: ${monthData.totalQuantity}
Reject Rate: ${monthData.rejectRate.toFixed(2)}%

Top Categories:
${monthData.topCategories.map(c => `- ${c.category}: ${c.count} items`).join('\n')}

Comparison to Previous Month:
- Quantity Change: ${monthData.comparisonToPrevious.quantityChange > 0 ? '+' : ''}${monthData.comparisonToPrevious.quantityChange}
- Reject Change: ${monthData.comparisonToPrevious.rejectChange > 0 ? '+' : ''}${monthData.comparisonToPrevious.rejectChange}%

Provide a concise, professional summary highlighting key points and actionable insights.
`;

  try {
    const response = await callGemini(prompt, cacheKey);
    return response;
  } catch (error) {
    return `Monthly Summary for ${monthData.month}: ${monthData.totalItems} items processed with ${monthData.rejectRate.toFixed(2)}% reject rate.`;
  }
}

export async function askQuestion(userQuery: string, context: any): Promise<string> {
  const prompt = `
You are an AI assistant for a medical inventory management system.

Context:
${JSON.stringify(context, null, 2)}

User Question: ${userQuery}

Provide a helpful, accurate answer based on the context provided.
`;

  try {
    const response = await callGemini(prompt);
    return response;
  } catch (error) {
    return 'I apologize, but I am unable to answer your question at this time. Please try again later.';
  }
}

// Utility to clear old cache entries
export function clearOldCache(): void {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp >= CACHE_DURATION) {
      cache.delete(key);
    }
  }
}
