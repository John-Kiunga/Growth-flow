import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateOutreachMessage(lead: any, type: string) {
  const prompt = `Write a short, direct human message to ${lead.name} from ${lead.company}.
  Context: Offering ${type} services.
  
  CRITICAL RULES:
  - NO AI NOISE: Avoid "I hope this finds you well", "I was impressed by", "I noticed your profile", "fellow professional".
  - ACT LIKE A HUMAN: Use simplified, casual but professional language. 
  - SHORT: Max 2 sentences. 
  - DIRECT: State the observation/value and ask a simple question.
  - TONE: Busy founder-to-founder. No fluff.
  - RETURN ONLY THE MESSAGE TEXT. No labels like "Message:" or quotation marks.
  - EXAMPLE STYLE: Hey ${lead.name}, saw ${lead.company}'s site. It's solid but noticed the mobile load is a bit sluggish—could probably fix that in a day. Open to a quick look?`;

  const fetchWithRetry = async (retries = 2, delay = 1000): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text.replace(/^["']|["']$/g, '').trim();
    } catch (error: any) {
      if (retries > 0 && (error?.message?.includes('429') || error?.message?.includes('503'))) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      throw error;
    }
  };

  return await fetchWithRetry();
}

export async function generateLinkedInComment(postContent: string, tone: string = 'Human') {
  const prompt = `Write a natural, authentic comment for this LinkedIn post. 
  
  Tone: ${tone}
  Post Content: "${postContent}"
  
  CRITICAL RULES:
  - NO AI NOISE: Avoid "Great post", "Insightful share", "Thank you for sharing", "I couldn't agree more".
  - NO CLICHES: Do not summarize the post or use generic business jargon.
  - ADD VALUE: Share a specific thought, ask a pointed question, or offer a unique perspective.
  - LANGUAGE: Use simplified, everyday language. 
  - LENGTH: 1-2 short sentences.
  - TONE FIDELITY: If tone is Witty, be actually funny. If Expert, be concise and data-backed.
  - RETURN ONLY THE COMMENT TEXT. No labels or surrounding quotes.`;

  const fetchWithRetry = async (retries = 2, delay = 1000): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      if (!response.text) throw new Error("Empty response from AI");
      return response.text.replace(/^["']|["']$/g, '').trim();
    } catch (error: any) {
      if (retries > 0 && (error?.message?.includes('429') || error?.message?.includes('503'))) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      throw error;
    }
  };

  try {
    return await fetchWithRetry();
  } catch (error) {
    console.error("Comment generation error:", error);
    throw error;
  }
}

export async function analyzePostForLeads(postContent: string) {
  const prompt = `Perform a high-level creative audit on this content. 
  Identify "Visual Debt" (outdated UI), "Technical Lag" (slow/unoptimized SEO), or "Brand Schism" (inconsistent messaging).
  
  RULES:
  1. REASON: Max 20 words. Be provocative and identify a specific creative gap. (e.g., "Generic brand presence masks true technical value in a competitive SaaS market.")
  2. SUGGESTED SERVICE: One specific service.
  3. OPPORTUNITY FOUND: True only if there's a clear B2B service gap.
  
  Return in JSON format.`;

  const fetchWithRetry = async (currentPrompt: string, retries = 3, delay = 2000): Promise<any> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: currentPrompt,
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
    } catch (error: any) {
      console.warn(`Retry ${3 - retries} failed:`, error?.message);
      if (retries > 0 && (error?.message?.includes('429') || error?.message?.includes('503') || error?.message?.includes('deadline'))) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(currentPrompt, retries - 1, delay * 1.5);
      }
      throw error;
    }
  };

  try {
    // Basic pre-check: if it's just a URL, adjust the prompt's context slightly
    const isUrlOnly = postContent.trim().startsWith('http') && !postContent.trim().includes(' ');
    const finalPrompt = isUrlOnly 
      ? `A URL was provided: "${postContent}". Based on the URL slug keywords (like brand audit, perception gap, etc.), identify a likely visual or strategic gap. ${prompt}`
      : prompt;

    const analysis = await fetchWithRetry(finalPrompt);
    
    // If AI couldn't find anything but it's a URL, give a specific hint
    if (!analysis.opportunityFound && isUrlOnly) {
      analysis.reason = "I can see the link, but for a perfect creative audit, try pasting the actual post text!";
    }
    
    return analysis;
  } catch (error) {
    console.error("Analysis error:", error);
    return {
      opportunityFound: false,
      reason: "Analysis timed out. Paste the full post text for a deeper creative audit.",
      confidence: 0,
      suggestedService: "General Outreach"
    };
  }
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
    Find 10-12 real or highly realistic B2B prospects for an agency looking to sell creative services (Design, SEO, Maintenance).
    
    TARGETING RULES:
    1. Focus on Startups (Series A/B), Seed-stage companies, and high-growth SMBs.
    2. Focus on smaller localized markets or niche players within the industry.
    3. AVOID massive corporations, household names, or Fortune 500 companies.
    4. Companies should have 5-50 employees and a clear need for external creative help.

    Niche: ${niche}
    Location: ${location}

    For each prospect, provide:
    1. Company Name
    2. Website URL (realistic)
    3. Industry
    4. Location
    5. Primary contact/decision maker name (realistic)
    6. A specific potential marketing/design need they likely have.
    7. A "Marketing Audit" summary (Max 20 words identifying a glaring gap like "Site is slow on mobile" or "SEO is missing for key terms").
    8. A 0-100 confidence score.
    9. A realistic LinkedIn profile URL.

    STYLE GUIDE: Use direct, punchy language. No "I noticed that...", "It appears that...". Just the facts.
    Example: "Hero section is cluttered. Hard to tell what they actually sell."
    
    Return the results as a valid JSON array.
  `;

  const fetchWithRetry = async (retries = 2, delay = 1000): Promise<Prospect[]> => {
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
    } catch (error: any) {
      if (retries > 0 && (error?.message?.includes('429') || error?.message?.includes('503'))) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      throw error;
    }
  };

  try {
    return await fetchWithRetry();
  } catch (error) {
    console.error("Prospecting error:", error);
    return [];
  }
}
