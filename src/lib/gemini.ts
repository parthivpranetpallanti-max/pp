import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const model = "gemini-3-flash-preview";

export async function analyzeDemand(orderData: any, history: any[]) {
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze this order for fake or noisy demand. 
    Order: ${JSON.stringify(orderData)}
    History: ${JSON.stringify(history)}
    
    Return JSON with:
    - confidenceScore (0-100)
    - status ('Real' | 'Suspicious' | 'Fake')
    - reason (string)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          confidenceScore: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: ['Real', 'Suspicious', 'Fake'] },
          reason: { type: Type.STRING }
        },
        required: ['confidenceScore', 'status', 'reason']
      }
    }
  });
  return JSON.parse(response.text);
}

export async function analyzeZone(zoneData: any) {
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze this zone health.
    Zone Data: ${JSON.stringify(zoneData)}
    
    Return JSON with:
    - status ('Healthy' | 'Risky' | 'Blackhole')
    - suggestion (string)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, enum: ['Healthy', 'Risky', 'Blackhole'] },
          suggestion: { type: Type.STRING }
        },
        required: ['status', 'suggestion']
      }
    }
  });
  return JSON.parse(response.text);
}

export async function suggestSubstitution(product: string, preferences: any) {
  const response = await ai.models.generateContent({
    model,
    contents: `Suggest a substitute for ${product} based on preferences: ${JSON.stringify(preferences)}.
    
    Return JSON with:
    - originalProduct (string)
    - suggestedProduct (string)
    - reason (string)
    - matchScore (0-100)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          originalProduct: { type: Type.STRING },
          suggestedProduct: { type: Type.STRING },
          reason: { type: Type.STRING },
          matchScore: { type: Type.NUMBER }
        },
        required: ['originalProduct', 'suggestedProduct', 'reason', 'matchScore']
      }
    }
  });
  return JSON.parse(response.text);
}
