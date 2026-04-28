import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateOutreachMessage(lead: any, type: string) {
  const prompt = `Generate a short, high-conversion LinkedIn outreach message for a lead.
  Lead Name: ${lead.name}
  Company: ${lead.company}
  Focus: ${type}
  
  Guidelines:
  - Keep it under 300 characters.
  - No generic "I hope this finds you well".
  - Mention a specific value proposition related to ${type}.
  - Call to action: A low-friction question.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
}

export async function generateLinkedInComment(postContent: string, tone: string = 'Expert') {
  const prompt = `Generate a thoughtful LinkedIn comment for the following post content.
  Tone: ${tone}
  
  Post: "${postContent}"
  
  Guidelines:
  - Add specific value or a unique perspective.
  - Tone should be ${tone}.
  - Keep it professional but conversational.
  - Maximum 2-3 sentences.
  - Do not use hashtags or emojis unless it fits the tone.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
}

export async function analyzePostForLeads(postContent: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this LinkedIn post content and identify if there is an opportunity for Web Design, SEO, or Marketing services.
    
    Post: "${postContent}"
    
    Return identifying markers in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          opportunityFound: { type: Type.BOOLEAN },
          reason: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          suggestedService: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export interface Prospect {
  name: string;
  company: string;
  website: string;
  industry: string;
  location: string;
  potential_need: string;
  linkedin_url: string;
  marketing_audit: string;
  confidence_score: number;
}

export async function findProspects(niche: string, location: string): Promise<Prospect[]> {
  const prompt = `
    Find 5 real or highly realistic B2B prospects for an agency looking to sell creative services (Design, SEO, Maintenance).
    Niche: ${niche}
    Location: ${location}

    For each prospect, provide:
    1. Company Name
    2. Website URL (realistic)
    3. Industry
    4. Location
    5. Primary contact/decision maker name (realistic)
    6. A specific potential marketing/design need they likely have.
    7. A "Marketing Audit" summary (2 sentences identifying a gap in their current digital presence).
    8. A 0-100 confidence score of them being a good lead.
    9. A realistic LinkedIn profile URL for the decision maker.

    Return the results as a valid JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING },
              website: { type: Type.STRING },
              industry: { type: Type.STRING },
              location: { type: Type.STRING },
              name: { type: Type.STRING },
              potential_need: { type: Type.STRING },
              marketing_audit: { type: Type.STRING },
              confidence_score: { type: Type.NUMBER },
              linkedin_url: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Prospecting error:", error);
    return [];
  }
}
